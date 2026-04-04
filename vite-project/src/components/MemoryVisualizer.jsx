import { useState, useEffect } from "react";

function PointerView() {
  const [step, setStep] = useState(0);
  const steps = [
    { code: "int a = 5;",     aVal: 5,   ptr: false },
    { code: "int *ptr = &a;", aVal: 5,   ptr: true  },
    { code: "*ptr = 100;",    aVal: 100, ptr: true  },
  ];
  const cur = steps[step];

  return (
    <div style={v.wrap}>
      <div style={v.label}>🗺️ 포인터 시각화</div>
      <div style={v.codeBar}><span style={{ fontFamily:"monospace", color:"#af52de", fontSize:13, fontWeight:600 }}>{cur.code}</span></div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, flexWrap:"wrap", margin:"14px 0" }}>
        <div style={{ ...v.cell, borderColor: cur.aVal===100 ? "var(--red)" : "var(--blue)", boxShadow:`0 0 12px ${cur.aVal===100?"rgba(255,59,48,0.15)":"rgba(0,122,255,0.15)"}` }}>
          <div style={v.addr}>0x100</div>
          <div style={{ ...v.val, color: cur.aVal===100 ? "var(--red)" : "var(--blue)", transition:"color 0.4s" }}>{cur.aVal}</div>
          <div style={v.name}>int a</div>
        </div>
        {cur.ptr && (
          <>
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
              <span style={{ fontSize:22, color:"var(--orange)", animation:"iosArrow 1.4s infinite" }}>→</span>
              <span style={{ fontSize:10, color:"var(--label3)" }}>가리킴</span>
            </div>
            <div style={{ ...v.cell, borderColor:"var(--orange)", boxShadow:"0 0 12px rgba(255,149,0,0.18)", animation:"iosMemBlock 0.4s ease" }}>
              <div style={v.addr}>0x104</div>
              <div style={{ ...v.val, color:"var(--orange)", fontSize:12 }}>0x100</div>
              <div style={v.name}>int *ptr</div>
            </div>
          </>
        )}
      </div>
      <div style={{ fontSize:13, color:"var(--label2)", textAlign:"center", lineHeight:1.6, minHeight:44 }}>
        {step===0 && "변수 a에 값 5가 주소 0x100에 저장됐어."}
        {step===1 && "ptr이 a의 주소(0x100)를 저장. 이제 ptr은 a를 가리켜!"}
        {step===2 && "*ptr = 100 → 그 주소의 값을 바꿨어. a도 100이 됐어!"}
      </div>
      <div style={{ display:"flex", gap:8, marginTop:12 }}>
        <button className="ios-btn ios-btn-gray ios-btn-sm" style={{ flex:1 }} onClick={() => setStep(0)}>↩ 처음</button>
        <button className="ios-btn ios-btn-sm" style={{ flex:1, background:"var(--blue)", color:"#fff", opacity:step===2?0.35:1 }} onClick={() => setStep(s=>Math.min(s+1,2))} disabled={step===2}>다음 →</button>
      </div>
    </div>
  );
}

function ArrayView() {
  const arr = [10,20,30,40,50];
  const [active,  setActive]  = useState(0);
  const [looping, setLooping] = useState(false);

  useEffect(() => {
    if (!looping) return;
    const id = setInterval(() => setActive(a => { if (a>=arr.length-1){setLooping(false);return 0;} return a+1; }), 500);
    return () => clearInterval(id);
  }, [looping]);

  return (
    <div style={v.wrap}>
      <div style={v.label}>📦 배열 시각화</div>
      <div style={{ display:"flex", gap:8, justifyContent:"center", margin:"12px 0", flexWrap:"wrap" }}>
        {arr.map((val,i) => (
          <div key={i} style={{ width:52, height:70, border:`1.5px solid ${i===active?"var(--teal)":"rgba(0,0,0,0.1)"}`, borderRadius:12, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:i===active?"rgba(48,176,199,0.08)":"#fff", transform:i===active?"scale(1.1)":"scale(1)", boxShadow:i===active?"0 4px 14px rgba(48,176,199,0.25)":"0 1px 4px rgba(0,0,0,0.06)", transition:"all 0.3s", cursor:"pointer" }} onClick={() => setActive(i)}>
            <div style={{ fontSize:10, color:"var(--teal)", marginBottom:4, fontWeight:700 }}>[{i}]</div>
            <div style={{ fontSize:20, fontWeight:900, color:i===active?"var(--teal)":"var(--label)" }}>{val}</div>
            <div style={{ fontSize:9, color:"var(--label3)", marginTop:4 }}>+{i*4}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:12, color:"var(--label2)", textAlign:"center" }}>
        arr[{active}] = {arr[active]} · 0x{(0x200+active*4).toString(16).toUpperCase()}
        <div style={{ fontSize:11, color:"var(--label3)", marginTop:3 }}>int는 4바이트 → 주소가 4씩 증가!</div>
      </div>
      <div style={{ display:"flex", gap:8, marginTop:12 }}>
        <button className="ios-btn ios-btn-gray ios-btn-sm" onClick={() => setActive(a=>Math.max(0,a-1))}>◀</button>
        <button className="ios-btn ios-btn-sm" style={{ flex:1, background:"var(--teal)", color:"#fff" }} onClick={() => {setActive(0);setLooping(true);}}>▶ for문 시뮬</button>
        <button className="ios-btn ios-btn-gray ios-btn-sm" onClick={() => setActive(a=>Math.min(arr.length-1,a+1))}>▶</button>
      </div>
    </div>
  );
}

function StackHeapView() {
  const [frames, setFrames] = useState([{ name:"main()", vars:["int a = 5","int b = 10"] }]);
  const [heap,   setHeap]   = useState([]);
  const [freed,  setFreed]  = useState(false);

  const callFunc = () => { if(frames.length<3) setFrames(f=>[...f,{name:`func${f.length}()`,vars:[`int x = ${f.length*10}`]}]); };
  const retFunc  = () => { if(frames.length>1) setFrames(f=>f.slice(0,-1)); };
  const doMalloc = () => { if(heap.length<3){setHeap(h=>[...h,{id:h.length,size:"16 bytes"}]);setFreed(false);} };
  const doFree   = () => { setFreed(true); setTimeout(()=>setHeap([]),500); };

  return (
    <div style={v.wrap}>
      <div style={v.label}>📚 Stack / Heap</div>
      <div style={{ display:"flex", gap:10, marginBottom:14 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, color:"var(--blue)", fontWeight:700, marginBottom:6, textAlign:"center" }}>STACK</div>
          <div style={{ display:"flex", flexDirection:"column-reverse", gap:6, minHeight:80 }}>
            {frames.map((f,i) => (
              <div key={i} style={{ background:i===frames.length-1?"rgba(0,122,255,0.1)":"rgba(0,122,255,0.04)", border:`0.5px solid ${i===frames.length-1?"rgba(0,122,255,0.4)":"rgba(0,122,255,0.12)"}`, borderRadius:10, padding:"8px 10px", animation:"iosMemBlock 0.4s ease" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"var(--blue)" }}>{f.name}</div>
                {f.vars.map((v2,j)=><div key={j} style={{ fontSize:10, color:"var(--label3)", marginTop:2 }}>{v2}</div>)}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, color:"var(--orange)", fontWeight:700, marginBottom:6, textAlign:"center" }}>HEAP</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6, minHeight:80 }}>
            {heap.length===0 && <div style={{ fontSize:11, color:"var(--label3)", textAlign:"center", padding:12 }}>비어있음</div>}
            {heap.map(h=>(
              <div key={h.id} style={{ background:freed?"rgba(255,59,48,0.06)":"rgba(255,149,0,0.08)", border:`0.5px solid ${freed?"rgba(255,59,48,0.3)":"rgba(255,149,0,0.35)"}`, borderRadius:10, padding:"8px 10px", opacity:freed?0.4:1, transition:"all 0.4s" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"var(--orange)" }}>malloc({h.size})</div>
                {freed && <div style={{ fontSize:10, color:"var(--red)" }}>⚠️ free됨</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <button className="ios-btn ios-btn-gray ios-btn-sm" style={{ flex:1 }} onClick={callFunc}>호출</button>
        <button className="ios-btn ios-btn-gray ios-btn-sm" style={{ flex:1 }} onClick={retFunc}>종료</button>
        <button className="ios-btn ios-btn-sm" style={{ flex:1, background:"var(--orange)", color:"#fff" }} onClick={doMalloc}>malloc</button>
        <button className="ios-btn ios-btn-sm" style={{ flex:1, background:"var(--red)", color:"#fff" }} onClick={doFree}>free</button>
      </div>
    </div>
  );
}

export default function MemoryVisualizer({ type = "pointer" }) {
  return (
    <div style={{ width: "100%" }}>
      {type === "pointer" && <PointerView />}
      {type === "array"   && <ArrayView />}
      {type === "stack"   && <StackHeapView />}
    </div>
  );
}

const v = {
  wrap:    { background:"#f7f8fa", border:"0.5px solid rgba(0,0,0,0.08)", borderRadius:14, padding:"14px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" },
  label:   { fontSize:11, color:"var(--label3)", fontWeight:700, letterSpacing:0.8, textTransform:"uppercase", textAlign:"center", marginBottom:10 },
  codeBar: { background:"#1c1c1e", borderRadius:8, padding:"8px 12px", textAlign:"center" },
  cell:    { width:76, height:76, border:"1.5px solid", borderRadius:12, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#fff", gap:2, boxShadow:"0 2px 8px rgba(0,0,0,0.08)" },
  addr:    { fontSize:9, color:"var(--label3)" },
  val:     { fontSize:22, fontWeight:900, fontFamily:"monospace" },
  name:    { fontSize:10, color:"var(--label2)" },
};
