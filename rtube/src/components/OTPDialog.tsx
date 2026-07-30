import { useEffect, useRef, useState, KeyboardEvent } from "react";
import axiosInstance from "../lib/axiosinstance";
import { toast } from "sonner";

interface OTPDialogProps {
  open: boolean;
  pendingUser: {
    userId: string;
    deviceId: string;
  };
  onSuccess: (result: unknown) => void;
  onClose: () => void;
}

const OTPDialog = ({ open, pendingUser, onSuccess, onClose }: OTPDialogProps) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const [resending, setResending] = useState(false);
  const isOtpComplete = otp.every((digit) => digit !== "");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const startCooldown = () => {
  setCooldown(30);

  const interval = setInterval(() => {
    setCooldown((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }

      return prev - 1;
    });
  }, 1000);

  return interval;
};


  useEffect(() => {
  if (!open) return;
  setTimeout(() => {
  inputRefs.current[0]?.focus();
}, 100);

  const interval = startCooldown();

  return () => clearInterval(interval);
}, [open]);

  if (!open) return null;


const handleResend = async () => {
  try {
    setResending(true);

    await axiosInstance.post("/user/resend-otp", {
      userId: pendingUser.userId,
    });

    toast.success("A new OTP has been sent to your email.");
    startCooldown();

  } catch (error: unknown) {
    const message =
      (error as any)?.response?.data?.message ||
      (error instanceof Error ? error.message : "Failed to resend OTP");
toast.error(message);
  } finally {
    setResending(false);
  }
};

const handleChange = (value: string, index: number) => {
  if (!/^\d?$/.test(value)) return;

  const newOtp = [...otp];
  newOtp[index] = value;
  setOtp(newOtp);

  if (value && index < 5) {
    inputRefs.current[index + 1]?.focus();
  }
};

const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
  if (e.key === "Backspace" && !otp[index] && index > 0) {
    inputRefs.current[index - 1]?.focus();
  }
};

const handleEnter = (e) => {
  if (e.key === "Enter") {
    handleVerify();
  }
};

const handlePaste = (e) => {
  e.preventDefault();

  const pastedData = e.clipboardData.getData("text").trim();

  // Only accept exactly 6 digits
  if (!/^\d{6}$/.test(pastedData)) return;

  const digits = pastedData.split("");
  setOtp(digits);

  // Focus the last box
  inputRefs.current[5]?.focus();
};

  const handleVerify = async () => {
    const enteredOtp = otp.join("");

if (enteredOtp.length !== 6) {
  toast.error("Please enter the complete 6-digit OTP.");
  return;
}
    try {
      setLoading(true);

      const response = await axiosInstance.post("/user/verify-otp", {
        userId: pendingUser.userId,
        otp: enteredOtp,
        deviceId: pendingUser.deviceId,
      });
      toast.success("OTP verified successfully!");
      onSuccess(response.data.result);

    } catch (error: unknown) {
      const message =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : "OTP verification failed");
toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-background p-6 rounded-xl w-[400px] shadow-xl">

        <h2 className="text-2xl font-bold mb-4">
          Verify Login
        </h2>

        <p className="text-muted-foreground mb-4">
          Enter the OTP sent to your email.
        </p>

        <div className="flex justify-between mb-4">
  {otp.map((digit, index) => (
    <input
      key={index}
      ref={(el) => {
        inputRefs.current[index] = el;
      }}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={digit}
      onChange={(e) => handleChange(e.target.value, index)}
      onKeyDown={(e) =>  {
        handleKeyDown(e, index);
        handleEnter(e);
      }}
      onPaste={handlePaste}
      className="w-12 h-12 text-center text-xl border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
    />
  ))}
</div>


        <div className="text-center mb-4">
  {cooldown > 0 ? (
    <p className="text-sm text-gray-500">
      Resend OTP in {cooldown}s
    </p>
  ) : (
    <button
      onClick={handleResend}
      disabled={resending}
      className="text-red-600 hover:underline"
    >
      {resending ? "Sending..." : "Resend OTP"}
    </button>
  )}
</div>

        <div className="flex gap-2 justify-end">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>

        <button
  onClick={handleVerify}
  disabled={loading || !isOtpComplete}
  className={`px-4 py-2 rounded text-white transition ${
    loading || !isOtpComplete
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-red-600 hover:bg-red-700"
  }`}
>
  {loading ? "Verifying..." : "Verify"}
</button>

        </div>

      </div>
    </div>
  );
};

export default OTPDialog;