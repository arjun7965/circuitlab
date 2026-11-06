import * as React from "react";
import {Slot} from "@radix-ui/react-slot";
import {cva,type VariantProps} from "class-variance-authority";
import {twMerge} from "tailwind-merge";
const buttonVariants=cva("btn",{variants:{variant:{default:"primary",outline:"outline",featured:"lime"}},defaultVariants:{variant:"default"}});
export function Button({asChild=false,variant,className,...props}:React.ComponentProps<"button">&VariantProps<typeof buttonVariants>&{asChild?:boolean}){
 const Component=asChild?Slot:"button";
 return <Component data-slot="button" className={twMerge(buttonVariants({variant}),className)} {...props}/>;
}

