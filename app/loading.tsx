import { FileCheck2 } from "lucide-react";
export default function Loading(){
 return <div className="ct-route-loading" role="status" aria-live="polite"><div className="ct-route-loading-stack"><i/><i/><FileCheck2 size={34}/></div><span>Opening your workspace…</span></div>;
}
