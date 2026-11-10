"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@animate-ui/react/primitives/buttons/button";
export default function ErrorPage({error,reset}:{error:Error & {digest?:string};reset:()=>void}){
 useEffect(()=>{ console.error("ConvoTools render error",error); },[error]);
 return <main className="ct-state-page ct-error-page"><header className="ct-subpage-nav"><Link href="/" className="ct-page-wordmark">Convo<span>Tools</span></Link><nav><Link href="/privacy">Privacy</Link></nav></header>
 <section className="ct-state-shell"><div className="ct-state-art" aria-hidden="true"><AlertTriangle size={65}/></div><span className="ct-eyebrow">A LITTLE DETOUR</span><h1 className="ct-error-title">Something got stuck.</h1><p>The page couldn&apos;t finish rendering. You can try again without losing the original files on your device.</p><div className="ct-state-actions"><Button onClick={()=>reset()}>Try again <RotateCcw size={17}/></Button><Link href="/">Back to home <ArrowLeft size={16}/></Link></div></section>
 </main>;
}
