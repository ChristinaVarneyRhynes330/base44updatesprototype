import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export default function ResponsiveDialog({ open, onOpenChange, title, description, children, className }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92dvh] border-[#E6C2BF]/30 bg-[#1A1515] text-[#F8F0EE]">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-2">
            <h2 className="font-heading text-[21px] text-[#F9EBE5]">{title}</h2>
            {description && (
              <p className="mt-1 text-[12px] leading-relaxed text-brand-body/72">{description}</p>
            )}
            <div className="mt-4">{children}</div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[88vh] overflow-y-auto border-[#E6C2BF]/30 bg-[#1A1515] text-[#F8F0EE] sm:max-w-lg",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-[22px] text-[#F9EBE5]">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-[12px] leading-relaxed text-brand-body/72">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}