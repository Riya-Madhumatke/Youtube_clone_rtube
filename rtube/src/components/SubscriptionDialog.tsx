import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { toast } from "sonner";
import { JSX } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const plans = [
  {
    name: "Bronze",
    price: 299,
    downloads: "5 Downloads / Day",
    color: "border-amber-600",
  },
  {
    name: "Silver",
    price: 499,
    downloads: "20 Downloads / Day",
    color: "border-gray-400",
  },
  {
    name: "Gold",
    price: 999,
    downloads: "Unlimited Downloads",
    color: "border-yellow-500",
  },
];

export default function SubscriptionDialog({
  open,
  onClose,
}: Props): JSX.Element {
  const { user } = useUser();
  const availablePlans = plans.filter((plan) => {
  if (!user) return true;

  if (user.plan === "free") return true;

  if (user.plan === "bronze")
    return ["Silver", "Gold"].includes(plan.name);

  if (user.plan === "silver")
    return ["Gold"].includes(plan.name);

  return false; // Gold
});

  const handleSubscription = async (plan: any) => {
  if (!user) {
    toast.error("Please sign in first");
    return;
  }

  try {
    const { data: order } = await axiosInstance.post(
      "/payment/create-order",
      {
        amount: plan.price,
        plan: plan.name.toLowerCase(),
      }
    );
    console.log(
  "Razorpay Key:",
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
);

   const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: order.currency,
  order_id: order.id,

  name: "MyTube",
  description: `${plan.name} Subscription`,

  prefill: {
    name: user.name,
    email: user.email,
  },

  modal: {
    escape: false,
  },

  retry: {
    enabled: false,
  },

  theme: {
    color: "#0059ff",
  },
      

      handler: async function (response: any) {
        try {
          const verify = await axiosInstance.post("/payment/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userId: user._id,
            plan: plan.name.toLowerCase(),
          });

          if (verify.data.success) {
            toast.success(`${plan.name} plan activated!`);

            onClose();

            window.location.reload();
          }
        } catch (error) {
          console.log(error);

          toast.error("Payment verification failed.");
        }
      },

    
    };

    const razor = new (window as any).Razorpay(options);

    razor.open();
  } catch (error) {
    console.log(error);

    toast.error("Unable to start payment.");
  }
};
  return (
    <Dialog open={open} onOpenChange={onClose}>
     <DialogContent
  className={`${
    availablePlans.length === 3
      ? "max-w-4xl"
      : availablePlans.length === 2
      ? "max-w-2xl"
      : "max-w-lg"
  }`}
>
  <DialogHeader>
    <DialogTitle className="text-2xl text-center">
  {user?.plan === "gold"
    ? "Premium Membership"
    : "Upgrade to Premium"}
    
</DialogTitle>

  </DialogHeader>

{user && (
  <div className="flex justify-center mt-2">
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold
        ${
          user.plan === "free"
            ? "bg-gray-100 text-gray-700"
            : user.plan === "bronze"
            ? "bg-amber-100 text-amber-700"
            : user.plan === "silver"
            ? "bg-gray-200 text-gray-800"
            : "bg-yellow-100 text-yellow-700"
        }`}
    >
      Current Plan: {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
    </span>
  </div>
)}

  {/* Gold Plan Message */}
  {user?.plan === "gold" && (
    <div className="text-center py-10">
      <Crown className="w-14 h-14 mx-auto text-yellow-500 mb-3" />

      <h2 className="text-2xl font-bold">
        You already have the Gold Plan
      </h2>

      <p className="text-gray-500 mt-2">
        Enjoy unlimited downloads and all premium features.
      </p>
      
    </div>
    
  )}

  {/* Subscription Cards */}
  {user?.plan !== "gold" && (
    <div
  className={`grid gap-6 mt-4 ${
    availablePlans.length === 3
      ? "md:grid-cols-3"
      : availablePlans.length === 2
      ? "md:grid-cols-2 max-w-2xl mx-auto"
      : "md:grid-cols-1 max-w-md mx-auto"
  }`}
>
      {availablePlans.map((plan) => (
        <div
          key={plan.name}
          className={`rounded-xl border-2 ${plan.color} p-6 flex flex-col`}
        >
          {/* Your existing plan card code */}
          <div className="flex justify-center mb-4">
      <Crown className="w-10 h-10 text-yellow-500" />
    </div>

    <h2 className="text-xl font-bold text-center">
      {plan.name}
    </h2>

    <p className="text-center text-3xl font-bold mt-3">
      ₹{plan.price}
    </p>

    <p className="text-center text-gray-500 mt-2">
      {plan.downloads}
    </p>

    <Button
  className="w-full mt-6"
  onClick={() => handleSubscription(plan)}
>
  {user?.plan === "free"
    ? `Buy ${plan.name}`
    : `Upgrade to ${plan.name}`}
</Button>

        </div>
      ))}
      
    </div>
  )}
</DialogContent>
    </Dialog>
  );
}