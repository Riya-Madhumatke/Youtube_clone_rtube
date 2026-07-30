import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const reasons = [
  "Spam",
  "Harassment",
  "Hate Speech",
  "Misinformation",
  "Inappropriate Content",
  "Other",
];

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const ReportDialog = ({
  open,
  onClose,
  onSubmit,
}: ReportDialogProps) => {
  const [selectedReason, setSelectedReason] = useState("");

  const handleSubmit = () => {
    if (!selectedReason) return;

    onSubmit(selectedReason);
    setSelectedReason("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>

        <DialogHeader>
          <DialogTitle>Report Comment</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">

          {reasons.map((reason) => (
            <button
              key={reason}
              onClick={() => setSelectedReason(reason)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                selectedReason === reason
                  ? "border-red-600 bg-red-50"
                  : ""
              }`}
            >
              {reason}
            </button>
          ))}

        </div>

        <Button
          className="w-full mt-4"
          disabled={!selectedReason}
          onClick={handleSubmit}
        >
          Submit Report
        </Button>

      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;