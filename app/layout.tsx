import type {Metadata} from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
export const metadata:Metadata = {title:"CircuitLab · Electronics workbench",icons:{icon:"/icon.svg"},description:"Learn electronics, explore circuits, and review hardware schematics."};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>{children}</body></html>
}

