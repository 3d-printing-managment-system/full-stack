"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function DeleteButton({
  onDelete,
  children,
}: {
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent className="">
        <AlertDialogHeader className="">
          <AlertDialogTitle className="">Are you sure?</AlertDialogTitle>

          <AlertDialogDescription className="">
            This action cannot be undone. This will permanently delete the
            selected item(s).
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="">
          <AlertDialogCancel className="">Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={onDelete} className="">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
