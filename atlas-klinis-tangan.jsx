import React, { useState, useMemo, useRef, useEffect } from "react";

/**
 * ATLAS KLINIS TANGAN
 * Referensi interaktif kondisi dermatologis & muskuloskeletal pada tangan.
 * Untuk apoteker: menekankan batas kewenangan (swamedikasi OTC vs obat keras/resep vs rujuk).
 *
 * Cara memperluas: tambahkan objek baru pada array KONDISI di bawah, lengkap dengan
 * koordinat pin (x,y) pada viewBox 400x560. Panel & kuis otomatis menyesuaikan.
 */

const SCOPE = {
  otc:   { label: "Swamedikasi (OTC)", color: "#1F8A5B", bg: "#E4F3EA" },
  resep: { label: "Perlu Resep / Obat Keras", color: "#B23B2E", bg: "#F7E5E2" },
  rujuk: { label: "Prioritas Rujuk Dokter", color: "#B4801F", bg: "#F6ECD8" },
  kombinasi: { label: "Kombinasi (OTC + Rujuk selektif)", color: "#0E7C86", bg: "#DDF0F1" },
};

const KONDISI = [
  {
    id: 1, nama: "Dermatitis Kontak", lokasi: "Punggung tangan (dorsum)",
    x: 216, y: 392, scope: "otc",
    etiologi: "Reaksi kulit akibat kontak dengan iritan (deterjen, pelarut) atau alergen (nikel, karet, wewangian). Bentuk iritan lebih sering pada pekerja basah.",
    tanda: "Eritema, gatal, kering-bersisik atau vesikel pada area kontak; batas mengikuti area paparan.",
    guideline: "Identifikasi & hindari pencetus; gunakan sarung tangan pelindung. Emolien rutin sebagai fondasi pemulihan sawar kulit. Kortikosteroid topikal untuk fase inflamasi, jangka pendek.",
    farmakoterapi: "Hidrokortison 1% (OTC) 2x/hari 1–2 minggu untuk kasus ringan. Emolien bebas pewangi beberapa kali sehari. Antihistamin oral (setirizin/loratadin) bila gatal mengganggu. Potensi menengah–tinggi (mometason, betametason) = obat keras, hanya via resep.",
    rujuk: "Bila lesi luas, basah/berkrusta (curiga infeksi sekunder), tidak membaik >2 minggu, atau berulang tanpa pencetus jelas.",
  },
  {
    id: 2, nama: "Skabies", lokasi: "Sela jari (interdigital)",
    x: 174, y: 322, scope: "kombinasi",
    etiologi: "Infestasi tungau Sarcoptes scabiei var. hominis. Menular lewat kontak kulit lama; khas gatal hebat malam hari.",
    tanda: "Papul/terowongan di sela jari, pergelangan, lipatan; gatal memberat malam; sering ada anggota serumah dengan keluhan sama.",
    guideline: "Terapi skabisida topikal ke SELURUH tubuh dari leher ke bawah (termasuk sela jari, kuku, genital). Obati SEMUA kontak serumah bersamaan. Cuci linen/handuk/pakaian dengan air panas & jemur; rendam yang tak bisa dicuci dalam kantong tertutup 3 hari.",
    farmakoterapi: "Permetrin 5% krim: oleskan, diamkan 8–12 jam, bilas; ulang hari ke-7. Antihistamin untuk gatal. Gatal dapat bertahan 1–2 minggu pascaeradikasi (bukan berarti gagal). Ivermektin oral = pilihan lini alternatif via resep dokter.",
    rujuk: "Skabies berkrusta (Norwegian), kegagalan terapi, bayi/ibu hamil, atau bila butuh ivermektin oral.",
  },
  {
    id: 3, nama: "Tinea Manuum", lokasi: "Dorsum & telapak (sering unilateral)",
    x: 272, y: 430, scope: "kombinasi",
    etiologi: "Infeksi dermatofita pada kulit tangan; klasik 'two feet–one hand' (satu tangan + kedua kaki terkena).",
    tanda: "Bercak bersisik dengan tepi aktif meninggi, kadang tepi vesikular; skuama halus difus pada telapak.",
    guideline: "Antijamur topikal untuk lesi terbatas selama 2–4 minggu, lanjutkan 1 minggu setelah bersih. Jaga tangan kering; obati tinea pedis penyerta agar tidak berulang.",
    farmakoterapi: "Topikal: terbinafin 1%, mikonazol, atau klotrimazol 2x/hari. Bila luas, mengenai telapak difus, atau gagal topikal → antijamur oral (terbinafin/itrakonazol) via resep.",
    rujuk: "Kegagalan terapi topikal, keterlibatan luas/telapak difus, keterlibatan kuku, atau pasien imunokompromais.",
  },
  {
    id: 4, nama: "Paronikia", lokasi: "Lipatan kuku jari telunjuk",
    x: 150, y: 156, scope: "rujuk",
    etiologi: "Radang lipatan kuku. Akut biasanya bakteri (S. aureus) pasca trauma/menggigit kuku; kronik terkait paparan basah berulang & Candida.",
    tanda: "Akut: nyeri, merah, bengkak lipatan kuku, dapat bernanah. Kronik: bengkak persisten, hilangnya kutikula, distrofi kuku.",
    guideline: "Akut ringan: kompres hangat 3–4x/hari + antiseptik; drainase bila terbentuk abses. Kronik: hindari basah kronis & iritan, keringkan tangan, pertimbangkan antijamur topikal.",
    farmakoterapi: "Antiseptik topikal untuk kasus ringan awal. Antibiotik (mis. berbasis stafilokokus) untuk paronikia akut bakterial = obat keras via resep. Kronik: antijamur/kortikosteroid topikal sesuai penilaian dokter.",
    rujuk: "Abses (butuh insisi-drainase), selulitis meluas, tidak membaik, diabetes/imunokompromais, atau kronik dengan distrofi kuku.",
  },
  {
    id: 5, nama: "Pompholyx (Eksim Dishidrotik)", lokasi: "Sisi jari & telapak",
    x: 300, y: 250, scope: "otc",
    etiologi: "Eksim vesikular idiopatik; dipicu stres, keringat, kontak logam/iritan, atau atopi.",
    tanda: "Vesikel kecil dalam, sangat gatal, di sisi jari & telapak ('gelembung sagu'); dapat mengelupas saat mengering.",
    guideline: "Hindari pencetus & iritan; kompres dingin saat akut; emolien intensif. Kortikosteroid topikal potensi sedang–tinggi untuk kendalikan flare jangka pendek.",
    farmakoterapi: "Emolien + hidrokortison 1% (OTC) untuk ringan. Flare sedang–berat butuh kortikosteroid potensi lebih tinggi (obat keras/resep). Antihistamin membantu gatal namun bukan terapi utama.",
    rujuk: "Flare berat/rekuren, tanda infeksi sekunder, atau butuh potensi kortikosteroid tinggi.",
  },
  {
    id: 6, nama: "Urtikaria", lokasi: "Pergelangan & menyebar",
    x: 240, y: 470, scope: "otc",
    etiologi: "Pelepasan histamin dari sel mast. Akut sering pasca alergen/infeksi; tipe kolinergik dipicu panas, olahraga, keringat, emosi.",
    tanda: "Bentol (wheal) meninggi, gatal, kemerahan, timbul-hilang <24 jam per lesi. Kolinergik: bentol kecil banyak saat berkeringat/kepanasan.",
    guideline: "Lini pertama antihistamin H1 generasi kedua secara reguler (bukan hanya bila perlu). Identifikasi & hindari pencetus; untuk kolinergik, kelola paparan panas & keringat bertahap.",
    farmakoterapi: "Setirizin/loratadin/feksofenadin 1x/hari; dosis dapat dinaikkan bertahap atas arahan dokter bila belum terkontrol. Hindari mengandalkan antihistamin generasi pertama yang menyebabkan kantuk.",
    rujuk: "🚑 SEGERA bila disertai bengkak bibir/lidah/tenggorokan, sesak, atau pusing (angioedema/anafilaksis). Juga bila urtikaria menetap >6 minggu (kronik).",
  },
  {
    id: 7, nama: "Veruka Vulgaris (Kutil)", lokasi: "Buku jari / sekitar kuku",
    x: 196, y: 236, scope: "otc",
    etiologi: "Infeksi Human Papillomavirus (HPV) pada keratinosit. Menular lewat kontak & autoinokulasi.",
    tanda: "Papul kasar hiperkeratotik, permukaan seperti kembang kol, sering ada titik hitam (kapiler trombosis).",
    guideline: "Banyak sembuh spontan dalam bulanan–tahunan. Terapi bertujuan mempercepat resolusi. Keratolitik topikal berbasis asam salisilat rutin & telaten; alternatif krioterapi di fasilitas kesehatan.",
    farmakoterapi: "Asam salisilat 12–40% topikal (OTC): rendam, kikir lembut, oleskan harian selama beberapa minggu. Butuh kepatuhan berminggu-minggu. Krioterapi = tindakan di faskes.",
    rujuk: "Diagnosis meragukan, lesi wajah/genital, jumlah banyak/rekalsitran, pasien diabetes/imunokompromais, atau gagal terapi topikal.",
  },
  {
    id: 8, nama: "Sindrom Terowongan Karpal", lokasi: "Pergelangan tangan (n. medianus)",
    x: 176, y: 486, scope: "rujuk",
    etiologi: "Kompresi nervus medianus di terowongan karpal. Terkait gerakan repetitif, kehamilan, hipotiroid, diabetes.",
    tanda: "Baal/kesemutan pada ibu jari, telunjuk, tengah; memberat malam; nyeri menjalar; lemah cengkeraman pada kasus lanjut.",
    guideline: "Bukan ranah farmakoterapi utama — edukasi & modifikasi aktivitas. Bidai pergelangan posisi netral (terutama malam) sebagai lini pertama konservatif. Nilai faktor risiko sistemik.",
    farmakoterapi: "Analgesik/NSAID jangka pendek hanya untuk meredakan nyeri, bukan terapi kausal. Injeksi kortikosteroid lokal atau pembedahan dekompresi untuk kasus sedang–berat (ranah dokter).",
    rujuk: "Gejala menetap/progresif, baal terus-menerus, kelemahan/atrofi otot tenar, atau butuh injeksi/bedah.",
  },
  {
    id: 9, nama: "Osteoartritis Tangan", lokasi: "Pangkal ibu jari (CMC) & sendi jari",
    x: 108, y: 360, scope: "kombinasi",
    etiologi: "Degenerasi kartilago sendi. Predileksi sendi karpometakarpal ibu jari, DIP (nodul Heberden) & PIP (nodul Bouchard).",
    tanda: "Nyeri sendi saat aktivitas, kaku pagi singkat (<30 menit), pembesaran tulang keras, penyempitan gerak, nyeri di pangkal ibu jari saat menjepit.",
    guideline: "Edukasi, latihan & proteksi sendi; bidai basis ibu jari untuk OA CMC. NSAID TOPIKAL direkomendasikan sebelum oral untuk OA tangan (rasio manfaat-risiko lebih baik).",
    farmakoterapi: "Parasetamol untuk nyeri ringan. Diklofenak gel topikal sebagai pilihan utama farmakologis. NSAID oral jangka pendek dengan hati-hati (lambung, ginjal, kardiovaskular) — pertimbangkan gastroprotektor bila berisiko.",
    rujuk: "Nyeri tidak terkendali, sendi bengkak-panas (bedakan dari artritis inflamasi/gout), atau perlu pertimbangan injeksi/bedah.",
  },
  {
    id: 10, nama: "Gout / Tofus", lokasi: "Sendi jari (DIP jari manis)",
    x: 241, y: 156, scope: "resep",
    etiologi: "Deposisi kristal monosodium urat akibat hiperurisemia. Serangan akut dipicu makanan tinggi purin, alkohol, dehidrasi, atau perubahan mendadak kadar urat.",
    tanda: "Serangan akut: sendi sangat nyeri, merah, bengkak, panas, onset cepat (sering malam). Kronik: tofus (benjolan keras deposit urat) di sekitar sendi/jari.",
    guideline: "Serangan akut: redakan inflamasi sedini mungkin & istirahatkan sendi. JANGAN memulai obat penurun urat saat serangan akut; jika sudah rutin dikonsumsi, jangan dihentikan. Terapi jangka panjang menargetkan kadar urat dengan kepatuhan.",
    farmakoterapi: "Akut: NSAID, kolkisin, atau kortikosteroid (pilihan & dosis oleh dokter — umumnya obat keras). Jangka panjang: alopurinol (penurun urat) via resep + edukasi kepatuhan & diet rendah purin, hidrasi cukup. Peran apoteker kuat pada kepatuhan & pemantauan.",
    rujuk: "Konfirmasi diagnosis serangan pertama, sendi tunggal panas-bengkak (singkirkan artritis septik), gout tofaseus/berulang, atau inisiasi terapi penurun urat.",
  },
];

// ---------- Ilustrasi tangan (dorsal, tangan kanan) ----------
function HandPlate({ selectedId, onSelect, quizMode, revealedId }) {
  const skin = "#DCC7B0";
  const skinLine = "#B79A7C";
  const nail = "#EBD9C6";

  return (
    <svg viewBox="0 0 400 560" className="hand-svg" aria-label="Ilustrasi punggung tangan dengan penanda kondisi klinis">
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#17323F" floodOpacity="0.18" />
        </filter>
      </defs>

      <g filter="url(#softShadow)">
        {/* Lengan bawah / pergelangan */}
        <rect x="150" y="452" width="132" height="96" rx="34" fill={skin} />
        {/* Telapak / punggung tangan */}
        <rect x="118" y="298" width="200" height="176" rx="52" fill={skin} />
        {/* Jari-jari */}
        <rect x="133" y="135" width="34" height="200" rx="17" fill={skin} />
        <rect x="178" y="100" width="36" height="235" rx="18" fill={skin} />
        <rect x="224" y="125" width="34" height="210" rx="17" fill={skin} />
        <rect x="268" y="178" width="30" height="160" rx="15" fill={skin} />
        {/* Ibu jari */}
        <g transform="rotate(-42 120 360)">
          <rect x="104" y="248" width="36" height="126" rx="18" fill={skin} />
          <ellipse cx="122" cy="256" rx="12" ry="9" fill={nail} stroke={skinLine} strokeWidth="1" />
        </g>
      </g>

      {/* Kuku */}
      <ellipse cx="150" cy="150" rx="11" ry="8.5" fill={nail} stroke={skinLine} strokeWidth="1" />
      <ellipse cx="196" cy="116" rx="12" ry="9" fill={nail} stroke={skinLine} strokeWidth="1" />
      <ellipse cx="241" cy="141" rx="11" ry="8.5" fill={nail} stroke={skinLine} strokeWidth="1" />
      <ellipse cx="283" cy="192" rx="9" ry="7" fill={nail} stroke={skinLine} strokeWidth="1" />

      {/* Detail buku jari & sendi (garis halus) */}
      <g stroke={skinLine} strokeWidth="1.3" fill="none" opacity="0.65" strokeLinecap="round">
        <path d="M138 232 q12 -6 24 0" />
        <path d="M183 208 q13 -6 26 0" />
        <path d="M229 224 q12 -6 24 0" />
        <path d="M272 252 q11 -5 22 0" />
        <path d="M138 300 q12 -6 24 0" />
        <path d="M183 300 q13 -6 26 0" />
        <path d="M229 300 q12 -6 24 0" />
        <path d="M132 430 q95 20 176 0" opacity="0.4" />
      </g>

      {/* Pin kondisi */}
      {KONDISI.map((k) => {
        const active = selectedId === k.id;
        const reveal = revealedId === k.id;
        return (
          <g
            key={k.id}
            transform={`translate(${k.x} ${k.y})`}
            className={`pin ${active ? "pin-active" : ""} ${reveal ? "pin-reveal" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={quizMode ? `Penanda lokasi ${k.id}` : `${k.nama} — ${k.lokasi}`}
            onClick={() => onSelect(k.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(k.id); } }}
          >
            <circle r="15" className="pin-halo" />
            <circle r="11" className="pin-ring" />
            <circle r="7.5" className="pin-core" />
            {!quizMode && <text className="pin-num" textAnchor="middle" dy="3.5">{k.id}</text>}
          </g>
        );
      })}
    </svg>
  );
}

export default function AtlasKlinisTangan() {
  const [selectedId, setSelectedId] = useState(1);
  const [quizMode, setQuizMode] = useState(false);
  const [quizTarget, setQuizTarget] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null); // {ok, id}
  const [order, setOrder] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const panelRef = useRef(null);

  const selected = useMemo(() => KONDISI.find((k) => k.id === selectedId), [selectedId]);

  function shuffled() {
    const a = KONDISI.map((k) => k.id);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startQuiz() {
    const ord = shuffled();
    setOrder(ord);
    setQIndex(0);
    setQuizTarget(ord[0]);
    setScore(0);
    setAttempts(0);
    setFeedback(null);
    setQuizMode(true);
    setSelectedId(null);
  }

  function nextQuiz() {
    const ni = qIndex + 1;
    if (ni >= order.length) {
      const fresh = shuffled();
      setOrder(fresh);
      setQIndex(0);
      setQuizTarget(fresh[0]);
    } else {
      setQIndex(ni);
      setQuizTarget(order[ni]);
    }
    setFeedback(null);
  }

  function exitQuiz() {
    setQuizMode(false);
    setFeedback(null);
    setQuizTarget(null);
    setSelectedId(quizTarget || 1);
  }

  function handleSelect(id) {
    if (!quizMode) {
      setSelectedId(id);
      if (panelRef.current) panelRef.current.scrollTop = 0;
      return;
    }
    // Mode kuis
    if (feedback && feedback.ok) return;
    const ok = id === quizTarget;
    setAttempts((a) => a + 1);
    if (ok && !feedback) setScore((s) => s + 1);
    setFeedback({ ok, id });
  }

  const quizCond = quizTarget ? KONDISI.find((k) => k.id === quizTarget) : null;

  return (
    <div className="atlas-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .atlas-root{
          --paper:#E9EDEF; --ink:#17323F; --ink-soft:#3E5964; --teal:#0E7C86;
          --line:#C3CED4; --card:#FDFDFB; --gold:#C79A3A;
          font-family:'IBM Plex Sans',system-ui,sans-serif;
          color:var(--ink); background:
            radial-gradient(1200px 600px at 15% -10%, #F2F5F6 0%, transparent 60%),
            var(--paper);
          min-height:100vh; padding:28px 20px 40px; box-sizing:border-box;
          -webkit-font-smoothing:antialiased;
        }
        .atlas-root *{box-sizing:border-box;}

        .masthead{max-width:1120px;margin:0 auto 22px;}
        .eyebrow{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.28em;
          text-transform:uppercase;color:var(--teal);margin:0 0 8px;}
        .title{font-family:'Fraunces',serif;font-weight:600;font-size:clamp(30px,4.4vw,46px);
          line-height:1.02;margin:0;letter-spacing:-.01em;}
        .title .amp{color:var(--gold);font-style:italic;}
        .subtitle{margin:10px 0 0;color:var(--ink-soft);font-size:15px;max-width:60ch;}

        .toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:18px;}
        .btn{font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.06em;
          text-transform:uppercase;border:1.5px solid var(--ink);background:transparent;
          color:var(--ink);padding:10px 16px;border-radius:2px;cursor:pointer;
          transition:all .16s ease;}
        .btn:hover{background:var(--ink);color:var(--paper);}
        .btn.primary{background:var(--teal);border-color:var(--teal);color:#fff;}
        .btn.primary:hover{background:#0a636b;border-color:#0a636b;}
        .btn:focus-visible{outline:3px solid var(--gold);outline-offset:2px;}
        .score{font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--ink-soft);
          margin-left:auto;padding:8px 12px;border:1px dashed var(--line);border-radius:2px;}
        .score b{color:var(--ink);}

        .grid{max-width:1120px;margin:0 auto;display:grid;
          grid-template-columns:minmax(0,0.92fr) minmax(0,1.08fr);gap:22px;align-items:start;}
        @media (max-width:860px){.grid{grid-template-columns:1fr;}}

        /* Plate */
        .plate{position:relative;background:var(--card);border:1px solid var(--line);
          border-radius:4px;padding:14px 14px 8px;
          box-shadow:0 1px 0 #fff inset, 0 18px 40px -28px rgba(23,50,63,.5);}
        .plate::before{content:"";position:absolute;inset:7px;border:1px solid var(--line);
          border-radius:2px;pointer-events:none;opacity:.55;}
        .plate-tag{position:absolute;top:-11px;left:18px;background:var(--ink);color:var(--paper);
          font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.18em;
          text-transform:uppercase;padding:5px 12px;border-radius:2px;}
        .plate-view{font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--ink-soft);
          text-align:right;letter-spacing:.1em;padding:2px 6px 6px;}
        .hand-svg{width:100%;height:auto;display:block;touch-action:manipulation;}

        /* Pins */
        .pin{cursor:pointer;}
        .pin-halo{fill:var(--teal);opacity:0;transition:opacity .18s;}
        .pin-ring{fill:#fff;stroke:var(--ink);stroke-width:1.5;transition:all .18s;}
        .pin-core{fill:var(--gold);transition:all .18s;}
        .pin-num{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:600;
          fill:var(--ink);pointer-events:none;}
        .pin:hover .pin-halo{opacity:.16;}
        .pin:hover .pin-core{fill:var(--teal);}
        .pin:focus-visible{outline:none;}
        .pin:focus-visible .pin-halo{opacity:.22;}
        .pin-active .pin-halo{opacity:.2;}
        .pin-active .pin-ring{stroke:var(--teal);stroke-width:2.5;}
        .pin-active .pin-core{fill:var(--teal);}
        .pin-reveal .pin-ring{stroke:#1F8A5B;stroke-width:2.5;}
        .pin-reveal .pin-core{fill:#1F8A5B;}

        /* Panel */
        .panel{background:var(--card);border:1px solid var(--line);border-radius:4px;
          padding:0;overflow:hidden;max-height:640px;display:flex;flex-direction:column;}
        .panel-scroll{overflow-y:auto;padding:22px 24px 26px;}
        .panel-scroll::-webkit-scrollbar{width:9px;}
        .panel-scroll::-webkit-scrollbar-thumb{background:var(--line);border-radius:9px;}

        .cond-index{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--teal);
          letter-spacing:.12em;}
        .cond-name{font-family:'Fraunces',serif;font-weight:600;font-size:28px;line-height:1.05;
          margin:4px 0 3px;letter-spacing:-.01em;}
        .cond-loc{font-size:13px;color:var(--ink-soft);margin:0 0 14px;
          font-family:'IBM Plex Mono',monospace;letter-spacing:.02em;}

        .scope-band{display:inline-flex;align-items:center;gap:8px;font-family:'IBM Plex Mono',monospace;
          font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;
          padding:7px 12px;border-radius:2px;margin-bottom:20px;}
        .scope-dot{width:8px;height:8px;border-radius:50%;}

        .sec{margin:0 0 16px;}
        .sec-h{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.16em;
          text-transform:uppercase;color:var(--ink-soft);margin:0 0 6px;
          padding-bottom:5px;border-bottom:1px solid var(--line);display:flex;gap:8px;align-items:center;}
        .sec-h .n{color:var(--gold);}
        .sec-b{font-size:14.5px;line-height:1.62;color:#243b44;margin:0;}
        .sec.rujuk .sec-b{background:#FBF0EC;border-left:3px solid #B23B2E;padding:11px 13px;border-radius:2px;}
        .sec.rujuk .sec-h{color:#B23B2E;border-color:#EBD2CB;}

        /* Quiz */
        .quiz-card{padding:22px 24px 26px;}
        .quiz-kicker{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.16em;
          text-transform:uppercase;color:var(--teal);margin:0 0 12px;}
        .quiz-q{font-family:'Fraunces',serif;font-size:20px;line-height:1.3;margin:0 0 6px;font-weight:600;}
        .quiz-signs{font-size:14.5px;line-height:1.6;color:#243b44;background:#F1F5F6;
          border:1px solid var(--line);border-radius:3px;padding:14px 16px;margin:14px 0 18px;}
        .quiz-hint{font-size:13px;color:var(--ink-soft);margin:0 0 4px;}
        .fb{border-radius:3px;padding:14px 16px;margin-top:16px;font-size:14.5px;line-height:1.55;}
        .fb.ok{background:#E4F3EA;border:1px solid #A9D9BE;color:#1a6b45;}
        .fb.no{background:#FBEBE7;border:1px solid #E7C0B6;color:#9c3326;}
        .fb b{font-family:'Fraunces',serif;}

        .footer{max-width:1120px;margin:26px auto 0;padding-top:16px;border-top:1px solid var(--line);
          font-size:12px;line-height:1.6;color:var(--ink-soft);}
        .footer b{color:var(--ink);}
      `}</style>

      <header className="masthead">
        <p className="eyebrow">Referensi Apoteker · Kondisi Tangan</p>
        <h1 className="title">Atlas Klinis <span className="amp">Tangan</span></h1>
        <p className="subtitle">
          Klik penanda pada tangan untuk membuka pedoman tata laksana, farmakoterapi,
          dan batas kewenangan tiap kondisi. Aktifkan Mode Kuis untuk menguji ketepatan
          diagnosis dari tanda klinis.
        </p>
        <div className="toolbar">
          {!quizMode ? (
            <button className="btn primary" onClick={startQuiz}>▷ Mulai Mode Kuis</button>
          ) : (
            <button className="btn" onClick={exitQuiz}>✕ Keluar Kuis</button>
          )}
          {!quizMode && (
            <span className="score">10 kondisi terpetakan</span>
          )}
          {quizMode && (
            <span className="score">Skor <b>{score}</b> / percobaan <b>{attempts}</b></span>
          )}
        </div>
      </header>

      <main className="grid">
        <section className="plate" aria-label="Ilustrasi tangan">
          <span className="plate-tag">Plate I · Dorsum Manus</span>
          <HandPlate
            selectedId={quizMode ? null : selectedId}
            onSelect={handleSelect}
            quizMode={quizMode}
            revealedId={quizMode && feedback && feedback.ok ? quizTarget : null}
          />
          <div className="plate-view">tampak punggung tangan · tangan kanan</div>
        </section>

        {/* Panel dinamis */}
        {!quizMode && selected && (
          <section className="panel">
            <div className="panel-scroll" ref={panelRef}>
              <div className="cond-index">Kondisi No. {String(selected.id).padStart(2, "0")}</div>
              <h2 className="cond-name">{selected.nama}</h2>
              <p className="cond-loc">◈ {selected.lokasi}</p>

              <div className="scope-band" style={{ background: SCOPE[selected.scope].bg, color: SCOPE[selected.scope].color }}>
                <span className="scope-dot" style={{ background: SCOPE[selected.scope].color }} />
                {SCOPE[selected.scope].label}
              </div>

              <div className="sec">
                <p className="sec-h"><span className="n">01</span> Etiologi</p>
                <p className="sec-b">{selected.etiologi}</p>
              </div>
              <div className="sec">
                <p className="sec-h"><span className="n">02</span> Tanda Klinis Kunci</p>
                <p className="sec-b">{selected.tanda}</p>
              </div>
              <div className="sec">
                <p className="sec-h"><span className="n">03</span> Pedoman Tata Laksana</p>
                <p className="sec-b">{selected.guideline}</p>
              </div>
              <div className="sec">
                <p className="sec-h"><span className="n">04</span> Farmakoterapi</p>
                <p className="sec-b">{selected.farmakoterapi}</p>
              </div>
              <div className="sec rujuk">
                <p className="sec-h">⚑ Kapan Merujuk ke Dokter</p>
                <p className="sec-b">{selected.rujuk}</p>
              </div>
            </div>
          </section>
        )}

        {quizMode && quizCond && (
          <section className="panel">
            <div className="quiz-card">
              <p className="quiz-kicker">Mode Kuis · Soal {qIndex + 1} / {order.length}</p>
              <h2 className="quiz-q">Berdasarkan tanda klinis berikut, klik lokasi yang tepat pada tangan:</h2>
              <div className="quiz-signs">{quizCond.tanda}</div>
              <p className="quiz-hint">Petunjuk lokasi umum: <em>gunakan penalaran anatomi</em>. Klik penanda pada ilustrasi.</p>

              {feedback && (
                <div className={`fb ${feedback.ok ? "ok" : "no"}`}>
                  {feedback.ok ? (
                    <>
                      ✔ <b>Tepat — {quizCond.nama}</b> ({quizCond.lokasi}).<br />
                      Kewenangan: {SCOPE[quizCond.scope].label}.
                    </>
                  ) : (
                    <>
                      ✕ Belum tepat. Itu lokasi <b>{KONDISI.find((k) => k.id === feedback.id)?.nama}</b>.
                      Coba lagi — perhatikan predileksi anatominya.
                    </>
                  )}
                </div>
              )}

              <div className="toolbar" style={{ marginTop: 18 }}>
                {feedback && feedback.ok && (
                  <button className="btn primary" onClick={nextQuiz}>Soal berikutnya →</button>
                )}
                {(!feedback || !feedback.ok) && (
                  <button className="btn" onClick={() => { setFeedback({ ok: true, id: quizTarget, skipped: true }); }}>
                    Lewati & tampilkan jawaban
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <b>Catatan penggunaan.</b> Alat ini adalah referensi cepat untuk apoteker, bukan pengganti
        penilaian klinis, anamnesis, maupun kewenangan dokter dalam mendiagnosis dan meresepkan.
        Regimen farmakoterapi bersifat pedoman umum — sesuaikan dengan kondisi individual pasien,
        kontraindikasi, serta rujuk pedoman resmi terkini (PIONAS/BPOM, panduan klinis, dan regulasi
        penggolongan obat) sebelum diterapkan. Status OTC vs obat keras dapat berbeda menurut sediaan
        dan kekuatan.
      </footer>
    </div>
  );
}
