"use client";

import { useState } from "react";
import SignIn  from "@/app/auth/signin/page";
import  SignUp  from "@/app/auth/signup/page";
import { motion, AnimatePresence } from "framer-motion";



const AuthPage = () => {
  const [isSignInView, setIsSignInView] = useState(true);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Form toggle buttons */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/20 backdrop-blur-sm p-1 rounded-lg">
            <button
              onClick={() => setIsSignInView(true)}
              className={`px-6 py-2 rounded-md transition-all duration-200 ${
                isSignInView
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignInView(false)}
              className={`px-6 py-2 rounded-md transition-all duration-200 ${
                !isSignInView
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Auth forms */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isSignInView ? "signin" : "signup"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {isSignInView ? <SignIn /> : <SignUp />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
export default AuthPage;