import { createContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../services/firebase";

// Create Context
export const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Clean up listener
    return () => unsubscribe();
  }, []);

  // Signup Function
  const signUpUser = async (email, password) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      return userCred;
    } catch (error) {
      alert("Something went wrong ❌");
      console.error("Signup Error:", error.message);
    }
  };

  // Login Function
  const logIn = async (email, password) => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      return userCred;
    } catch (error) {
      alert("Something went wrong ❌");
      console.error("Login Error:", error.message);
    }
  };

  // Logout Function
  const logOut = async () => {
    console.log("Logging out from context...");
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUpUser, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};
