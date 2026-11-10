import { ImageResponse } from "next/og";
export const alt="ConvoTools — Browser-first file tools for the work between the work";
export const size={width:1200,height:630};
export const contentType="image/png";
export default function Image(){
 return new ImageResponse(<div style={{display:"flex",flexDirection:"column",position:"relative",background:"#122831",width:"100%",height:"100%",padding:76,color:"#f9faf2",fontFamily:"sans-serif"}}>
 <div style={{display:"flex",alignItems:"center",gap:13,fontSize:32,fontWeight:700}}>◈ Convo<span style={{color:"#d5fa77"}}>Tools</span></div>
 <div style={{display:"flex",flexDirection:"column",marginTop:105,fontSize:79,lineHeight:1.04,fontWeight:700,letterSpacing:-4}}>Everything your files <span style={{color:"#d5fa77"}}>need.</span></div>
 <div style={{display:"flex",fontSize:27,marginTop:32,color:"#b8d0cf"}}>PDF · Images · Documents · Media · Developer tools</div>
 <div style={{position:"absolute",bottom:65,left:76,fontSize:21,color:"#bed5d1"}}>One browser-first workspace. No account required.</div>
 <div style={{position:"absolute",right:90,top:60,width:230,height:230,border:"2px solid #84a8a588",borderRadius:34,transform:"rotate(16deg)"}}/>
 <div style={{position:"absolute",right:145,top:92,width:230,height:230,border:"2px solid #d5fa77",background:"#d5fa77",borderRadius:34,transform:"rotate(-12deg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:100,color:"#122831"}}>↗</div>
 </div>);
}
