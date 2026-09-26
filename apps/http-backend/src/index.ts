 import express from 'express';
 import jwt from 'jsonwebtoken';
 import { JWT_SECRET } from '@repo/backend-common/config';
 import { CreateRoomSchema , CreateUserSchema, SigninSchema, ResetPasswordSchema } from '@repo/common/schema';
 import { prismaClient } from '@repo/database/db';
 import { middleware } from './middleware.js';
 import Cookie from "cookie";
 import bcrypt from 'bcrypt'
 import cors from 'cors'
 const app = express();
  app.use(cors({
    origin: (origin, callback) => {
      // Allow any origin (reflects origin header, allowing Vercel and localhost with credentials)
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
  }));
 app.use(express.json());
const bcryptSalt = 10
const PORT = Number(process.env.PORT) || 4000
const TOKEN_EXPIRY = '7d'
app.post('/signup', async (req, res) => {
    const data = CreateUserSchema.safeParse(req.body);
    if (!data.success) {
        res.status(400).json({
            message : "Invalid data"
        });
        return;
    }
    const { email, password , firstName , lastName , Avatar} = data.data;
    // db call
    try{
        const hashedPassword = await bcrypt.hash(password, bcryptSalt);
        const user = await prismaClient.user.create({
            data : {
                email,
                password : hashedPassword,
                firstName,
                lastName,
                Avatar
            }
        });
        const userId = user.id;
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
        res.json({
            token ,
            message : "User created successfully"

        });
    }catch(e: any){
        // Prisma unique constraint violation (email already exists)
        if (e?.code === 'P2002') {
            res.status(409).json({
                message : "Email already registered"
            });
            return;
        }
        res.status(500).json({
            message : "Internal Server Error"
        });
    }
   
});
app.post('/signin', async (req, res) => {
    const data = SigninSchema.safeParse(req.body);
    if (!data.success) {
        res.status(400).json({
            message : "Invalid data"
        })
        return;
    };
    // db call
    const email = data.data.email;
    const password = data.data.password;
    try {
        const user = await prismaClient.user.findUnique({
            where : {
                email
            }
        });
        // Use the same generic message for "no user" and "wrong password"
        // so attackers can't enumerate which emails are registered.
        if(!user || !(await bcrypt.compare(password, user.password))){
            res.status(401).json({
                message : "Invalid email or password"
            });
            return;
        }

        const userId = user.id;
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
        res.json({
            token
        });
    } catch (e) {
        res.status(500).json({
            message : "Internal Server Error"
        });
    }
});
app.post('/reset-password', async (req, res) => {
    const data = ResetPasswordSchema.safeParse(req.body);
    if (!data.success) {
        res.status(400).json({
            message: "Invalid data. Password must be at least 8 characters long."
        });
        return;
    }
    const { email, newPassword } = data.data;
    try {
        const user = await prismaClient.user.findUnique({
            where: { email }
        });
        if (!user) {
            res.status(404).json({
                message: "No account found with this email address"
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, bcryptSalt);
        await prismaClient.user.update({
            where: { email },
            data: {
                password: hashedPassword
            }
        });

        res.json({
            message: "Password reset successfully. You can now sign in with your new password."
        });
    } catch (e) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});
app.post('/room',middleware , async (req, res) => {
    const data = CreateRoomSchema.safeParse(req.body);
    // db.createRoom(req.body);
    if(!data.success){
        res.status(400).json({
            message: "Invalid data"
        })
        return;
    }
    const userId = req.userId;
    try{
        const room = await prismaClient.room.create({
            data : {
                slug : data.data.name,
                adminId : userId
            }
        })
        res.status(201).json({
            message : "Room created successfully",
            roomId : room.id
        });

    }catch(e: any){
        if (e?.code === 'P2002') {
            res.status(409).json({
                message : "Room already created with this slug"
            })
            return;
        }
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
    
    
});
app.get('/chats/:roomId', middleware, async (req,res) => {
    const roomId = Number(req.params.roomId);
    if (Number.isNaN(roomId)) {
        res.status(400).json({
            message: "Invalid room id"
        })
        return;
    }
    try{
        const messages = await prismaClient.chat.findMany({
            where : {
                roomId: roomId
            },
            orderBy :{
                id : "desc"
            },
            take : 10000
        })
        res.json({
            messages
        })
    }catch(e){
        res.status(500).json({
            message: "Failed to fetch data"
        })
    }


})
app.get('/room/:slug', middleware, async (req, res) => {

    const slug = req.params.slug
    try {
        const room = await prismaClient.room.findFirst({
            where : {
                slug
            }
        })
        if (!room) {
            res.status(404).json({
                message : "Room not found"
            })
            return;
        }
        res.json({
            room
        })
    } catch (e) {
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
})

app.get('/rooms', middleware, async (req, res) => {
    try {
        const rooms = await prismaClient.room.findMany({
            select: {
                id: true,
                createdAt: true,
                slug: true,
                adminId: true
            }
        });
        
        res.status(200).json({
            rooms,
            currentUserId: req.userId
        });
        
    } catch (error) {
        res.status(500).json({
            message: "failed to fetch rooms"
        });
    }
});

app.delete('/room/:roomId', middleware, async (req, res) => {
    const param = req.params.roomId;
    const roomIdNum = Number(param);
    const userId = req.userId;

    try {
        const room = await prismaClient.room.findFirst({
            where: Number.isNaN(roomIdNum)
                ? { slug: param }
                : { id: roomIdNum }
        });

        if (!room) {
            res.status(404).json({
                message: "Room not found"
            });
            return;
        }

        if (room.adminId !== userId) {
            res.status(403).json({
                message: "You can only delete your own rooms"
            });
            return;
        }

        // Delete associated chat messages first, then delete the room
        await prismaClient.chat.deleteMany({
            where: { roomId: room.id }
        });
        await prismaClient.room.delete({
            where: { id: room.id }
        });

        res.status(200).json({
            message: "Room deleted successfully",
            roomId: room.id
        });
    } catch (error: any) {
        console.error("Failed to delete room:", error);
        res.status(500).json({
            message: error?.message || "Failed to delete room"
        });
    }
});




 app.listen(PORT, '0.0.0.0', () => {
    console.log(`HTTP Backend listening on port ${PORT}`);
 });
