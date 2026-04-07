import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertTriangle, CheckCircle2, Info, Loader2 } from "lucide-react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'success' | 'info';
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm Action",
    cancelText = "Cancel",
    variant = "info",
    isLoading = false,
}: ConfirmationModalProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'destructive':
                return {
                    icon: <AlertTriangle className="h-12 w-12 text-rose-500" />,
                    iconBg: 'bg-rose-100/50',
                    buttonBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
                    title: 'text-gray-900',
                };
            case 'success':
                return {
                    icon: <CheckCircle2 className="h-12 w-12 text-emerald-500" />,
                    iconBg: 'bg-emerald-100/50',
                    buttonBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
                    title: 'text-gray-900',
                };
            default:
                return {
                    icon: <Info className="h-12 w-12 text-primary" />,
                    iconBg: 'bg-primary/10',
                    buttonBg: 'bg-primary hover:bg-primary/90 shadow-primary/20',
                    title: 'text-gray-900',
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-white">
                <div className="p-10 flex flex-col items-center text-center">
                    <div className={`inline-flex items-center justify-center w-24 h-24 ${styles.iconBg} rounded-full mb-8`}>
                        {styles.icon}
                    </div>

                    <DialogTitle className={`text-3xl font-black tracking-tight mb-4 ${styles.title}`}>
                        {title}
                    </DialogTitle>

                    <DialogDescription className="text-gray-500 font-medium text-base leading-relaxed mb-10 px-4">
                        {description}
                    </DialogDescription>

                    <div className="flex flex-col w-full space-y-3">
                        <Button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`h-14 w-full text-sm font-black uppercase tracking-widest text-white rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center ${styles.buttonBg}`}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                confirmText
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={isLoading}
                            className="h-14 w-full text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-2xl transition-all"
                        >
                            {cancelText}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
