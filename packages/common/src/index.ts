import {z} from 'zod';

export const CreateUserSchema = z.object({
    email : z.string().email().min(3).max(255),
    password : z.string().min(8).max(255),
    firstName : z.string().min(3).max(255),
    lastName : z.string().min(3).max(255),
    Avatar : z.string().min(3).max(255).optional()
});

export const SigninSchema = z.object({
    email : z.string().email().min(3).max(255),
    password : z.string().min(8).max(255)
});

export const CreateRoomSchema = z.object({
    name : z.string().min(3).max(255),
})