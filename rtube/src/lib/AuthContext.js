import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState } from "react";
import { createContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { useEffect, useContext } from "react";
import OTPDialog from "../components/OTPDialog";

const UserContext = createContext();
const getDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);
  }

  return deviceId;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [otpPending, setOtpPending] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const login = (userdata) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
  };
  const logout = async () => {
    setUser(null);
    setOtpPending(false);
    setPendingUser(null);

    localStorage.removeItem("user");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };
  const refreshUser = async (userId) => {
  try {
    const response = await axiosInstance.get(`/user/${userId}`);
    login(response.data);
  } catch (error) {
    console.error("Failed to refresh user:", error);
  }
};
  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;
      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
        deviceId: getDeviceId(),
      };
      const response = await axiosInstance.post("/user/login", payload);

if (response.data.otpRequired) {
  setOtpPending(true);
  setPendingUser({
    userId: response.data.userId,
    deviceId: payload.deviceId,
  });

  return;
}

login(response.data.result);
setOtpPending(false);
setPendingUser(null);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseuser) => {
    if (!firebaseuser) {
      setUser(null);
      setOtpPending(false);
      setPendingUser(null);
      localStorage.removeItem("user");
      return;
    }

    // Restore user from localStorage if available
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  });

  return () => unsubscribe();
}, []);
  
      useEffect(() => {
  if (!user) return;

  if (user.theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        handlegooglesignin,
        refreshUser,
      }}
    >
      {children}

      {otpPending && (
        <OTPDialog
          open={true}
          pendingUser={pendingUser}
          onClose={async () => {
            setOtpPending(false);
            setPendingUser(null);
            await logout();
          }}
          onSuccess={(userData) => {
            login(userData);
            setOtpPending(false);
            setPendingUser(null);
          }}
        />
      )}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);