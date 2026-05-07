@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Noto Sans KR',sans-serif;background:#F5F3EE;color:#1C1A16;font-size:14px;min-height:100vh;}

/* ─── LOCK ─── */
.lock{position:fixed;inset:0;background:#F5F3EE;display:flex;align-items:center;justify-content:center;z-index:999;}
.lock-box{background:#FFFFFF;border:1px solid #E8E4DC;border-radius:20px;padding:2.5rem 2rem;width:100%;max-width:340px;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,.08);}
.lock-logo{width:48px;height:48px;background:#4A7C6F;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 1.2rem;font-size:22px;}
.lock-title{font-size:18px;font-weight:600;margin-bottom:4px;}
.lock-sub{font-size:12px;color:#9A9590;margin-bottom:1.5rem;}
.lock-inp{width:100%;border:1.5px solid #D9D4C8;border-radius:10px;padding:11px;font-size:15px;text-align:center;letter-spacing:6px;background:#FAF9F6;color:#1C1A16;font-family:'Noto Sans KR',sans-serif;margin-bottom:8px;}
.lock-inp:focus{outline:none;border-color:#4A7C6F;}
.lock-err{font-size:12px;color:#E24B4A;margin-bottom:10px;min-height:18px;}
.lock-btn{width:100%;background:#4A7C6F;color:#fff;border:none;border-radius:10px;padding:11px;font-size:14px;font-weight:500;cursor:pointer;font-family:'Noto Sans KR',sans-serif;}

/* ─── LAYOUT ─── */
.app{display:flex;min-height:100vh;}
.sb{
  width:64px;
  min-height:100vh;
  background:#FFFFFF;
  border-right:1px solid #E8E4DC;
  display:none;
  flex-direction:column;
  position:fixed;
  top:0;left:0;bottom:0;
  z-index:200;
  overflow:hidden;
  transition:width .22s cubic-bezier(.4,0,.2,1);
}
.sb.show{display:flex;}
.sb.sb-expanded{width:220px;}
.main{margin-left:64px;flex:1;display:none;min-height:100vh;}
.main.show{display:block;}

/* ─── SIDEBAR ─── */
.sb{
  width:64px;
  min-height:100vh;
  background:#FFFFFF;
  border-right:1px solid #E8E4DC;
  display:none;
  flex-direction:column;
  position:fixed;
  top:0;left:0;bottom:0;
  z-index:200;
  overflow:hidden;
  transition:width .22s cubic-bezier(.4,0,.2,1);
}
.sb.show{display:flex;}
/* hover 또는 .sb-expanded 클래스일 때 넓어짐 */
.sb.sb-expanded{width:220px;}
.main{margin-left:64px;flex:1;display:none;min-height:100vh;transition:margin-left .22s cubic-bezier(.4,0,.2,1);}
.main.show{display:block;}

.sb-top{padding:16px 12px 8px;background:#FFFFFF;overflow:hidden;}
.sb-brand{display:flex;align-items:center;gap:10px;margin-bottom:16px;white-space:nowrap;}
.sb-logo{width:36px;height:36px;background:#4A7C6F;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
.sb-bname{font-size:15px;font-weight:700;color:#1C1A16;opacity:0;transition:opacity .15s .05s;letter-spacing:-.3px;}
.sb-expanded .sb-bname{opacity:1;}

.sb-prof{background:#FAF9F6;border-radius:10px;padding:8px;margin-bottom:8px;display:flex;align-items:center;gap:8px;overflow:hidden;}
.sb-av{width:34px;height:34px;background:linear-gradient(135deg,#4A7C6F,#6B9E94);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0;}
.sb-prof-info{opacity:0;transition:opacity .15s .05s;white-space:nowrap;overflow:hidden;}
.sb-expanded .sb-prof-info{opacity:1;}
.sb-uname{font-size:13px;font-weight:500;color:#1C1A16;}
.sb-role{font-size:11px;color:#9A9590;}

.sb-sec{
  padding:8px 0 4px;
  font-size:9px;font-weight:700;color:#9A9590;
  letter-spacing:.12em;text-transform:uppercase;
  text-align:center;
  white-space:nowrap;overflow:hidden;
  transition:padding .22s, text-align .22s;
}
.sb-expanded .sb-sec{padding:8px 20px 4px;text-align:left;}

.sb-ul{list-style:none;padding:0 8px;}
.sb-ul li a{
  display:flex;align-items:center;gap:0;
  padding:10px 0;
  border-radius:10px;
  font-size:13px;color:#5A5550;text-decoration:none;
  transition:background .15s, gap .22s, padding .22s;
  justify-content:center;
  white-space:nowrap;overflow:hidden;
}
.sb-expanded .sb-ul li a{
  gap:10px;padding:10px 12px;justify-content:flex-start;
}
.sb-ul li a:hover{background:#FAF9F6;color:#1C1A16;}
.sb-ul li a.on{background:#E8F0EE;color:#4A7C6F;font-weight:500;}

.sb-ico{font-size:18px;width:24px;text-align:center;flex-shrink:0;}
.sb-label{
  opacity:0;
  max-width:0;
  overflow:hidden;
  transition:opacity .15s .05s, max-width .22s;
  white-space:nowrap;
}
.sb-expanded .sb-label{opacity:1;max-width:160px;}

.sb-bot{margin-top:auto;padding:12px 8px;border-top:1px solid #E8E4DC;background:#FFFFFF;}
.sb-pdf{
  display:flex;align-items:center;gap:0;
  padding:8px 0;border-radius:10px;
  font-size:12px;color:#9A9590;cursor:pointer;
  border:none;background:none;width:100%;
  font-family:'Noto Sans KR',sans-serif;
  justify-content:center;
  transition:background .15s, gap .22s, padding .22s;
  white-space:nowrap;overflow:hidden;
}
.sb-expanded .sb-pdf{gap:8px;padding:8px 12px;justify-content:flex-start;}
.sb-pdf:hover{background:#FAF9F6;color:#5A5550;}

/* 모바일 탭바 — 기본 숨김 */
.mobile-tabbar{display:none;}

/* ─── PAGE ─── */
.page{display:none;padding:28px 32px;}
.page.on{display:block;}
.ph{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;}
.pt{font-size:20px;font-weight:600;color:#1C1A16;}
.ps{font-size:12px;color:#9A9590;margin-top:3px;}

/* ─── BUTTONS ─── */
.btn{background:#FFFFFF;border:1px solid #D9D4C8;border-radius:10px;padding:7px 14px;font-size:13px;cursor:pointer;color:#1C1A16;font-family:'Noto Sans KR',sans-serif;transition:all .15s;display:inline-flex;align-items:center;gap:6px;}
.btn:hover{background:#FAF9F6;}
.btn-p{background:#4A7C6F;color:#fff;border-color:transparent;}
.btn-p:hover{opacity:.88;background:#4A7C6F;}
.btn-sm{padding:5px 11px;font-size:12px;}
.btn-g{background:transparent;border-color:transparent;color:#9A9590;}
.btn-g:hover{background:#FAF9F6;color:#1C1A16;}

/* ─── CHIPS ─── */
.chip{padding:5px 12px;border-radius:20px;font-size:12px;cursor:pointer;border:1px solid #E8E4DC;color:#9A9590;background:transparent;font-family:'Noto Sans KR',sans-serif;transition:all .15s;}
.chip:hover{border-color:#D9D4C8;color:#1C1A16;}
.chip.on{background:#1C1A16;color:#fff;border-color:transparent;}

/* ─── DASHBOARD ─── */
.dg{margin-bottom:24px;}
.dg-date{font-size:12px;color:#9A9590;margin-bottom:4px;}
.dg-hello{font-size:22px;font-weight:600;color:#1C1A16;}
.dc{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;}
.dc-card{background:#FFFFFF;border:1px solid #E8E4DC;border-radius:14px;padding:20px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.06);}
.dc-lbl{font-size:12px;color:#9A9590;margin-bottom:14px;font-weight:500;}
.donut-w{position:relative;width:90px;height:90px;margin:0 auto 10px;}
.donut-svg{width:90px;height:90px;transform:rotate(-90deg);}
.donut-bg{fill:none;stroke:#E8E4DC;stroke-width:10;}
.donut-fill{fill:none;stroke-width:10;stroke-linecap:round;stroke-dasharray:220;stroke-dashoffset:220;transition:stroke-dashoffset .8s ease;}
.donut-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#1C1A16;}
.dc-desc{font-size:11px;color:#9A9590;}
.ds{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.ds-card{background:#FFFFFF;border:1px solid #E8E4DC;border-radius:14px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.06);}
.ds-title{font-size:13px;font-weight:600;margin-bottom:12px;color:#1C1A16;}
.ds-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #E8E4DC;}
.ds-item:last-child{border-bottom:none;}
.ds-name{font-size:13px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#1C1A16;}
.ds-due{font-size:11px;color:#9A9590;white-space:nowrap;}
.ds-empty{font-size:12px;color:#9A9590;text-align:center;padding:1.5rem 0;}

/* ─── TASKS ─── */
.tb{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;}
.tcat{margin-bottom:28px;}
.tcat-hd{display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid #E8E4DC;}
.tcat-ico{font-size:18px;}
.tcat-ttl{font-size:15px;font-weight:600;color:#1C1A16;}
.tcat-cnt{font-size:12px;color:#9A9590;background:#FAF9F6;padding:2px 8px;border-radius:20px;border:1px solid #E8E4DC;}
.tcat-add{margin-left:auto;}
.ttbl{background:#FFFFFF;border:1px solid #E8E4DC;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06);}
table{width:100%;border-collapse:collapse;table-layout:fixed;}
th{padding:9px 14px;text-align:left;font-size:11px;font-weight:600;color:#9A9590;background:#FAF9F6;border-bottom:1px solid #E8E4DC;}
tr.row{border-bottom:1px solid #E8E4DC;cursor:pointer;transition:background .1s;}
tr.row:last-child{border-bottom:none;}
tr.row:hover{background:#FAF9F6;}
td{padding:10px 14px;vertical-align:middle;color:#1C1A16;}
.pbar{height:3px;background:#E8E4DC;border-radius:2px;overflow:hidden;margin-top:3px;}
.pfill{height:100%;border-radius:2px;}
.slbl{font-size:11px;color:#9A9590;}
.empty-r{text-align:center;padding:2.5rem;color:#9A9590;font-size:13px;}

/* 태스크 테이블/카드 토글 */
.task-table-wrap{display:block;}
.task-cards-wrap{display:none;}

/* 태스크 카드 스타일 */
.task-card{background:#FFFFFF;border:1px solid #E8E4DC;border-radius:12px;padding:14px 16px;margin-bottom:8px;cursor:pointer;transition:background .1s;box-shadow:0 1px 3px rgba(0,0,0,.05);}
.task-card:last-child{margin-bottom:0;}
.task-card:hover{background:#FAF9F6;}
.task-card:active{background:#E8F0EE;}
.task-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px;}
.task-card-name{font-size:14px;font-weight:600;color:#1C1A16;flex:1;line-height:1.4;}
.task-card-badges{display:flex;gap:4px;flex-wrap:wrap;flex-shrink:0;}
.task-card-step{margin-bottom:8px;}
.task-card-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.task-card-note{margin-top:6px;font-size:11px;color:#9A9590;background:#FAF9F6;border-radius:6px;padding:4px 8px;}

/* ─── BADGES ─── */
.bdg{display:inline-flex;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:500;white-space:nowrap;}
.b-pkg{background:#F0EEFB;color:#6B5FA0;}
.b-vid{background:#E8F5EE;color:#2A7A5A;}
.b-prj{background:#FEF0E6;color:#B85C1A;}
.b-gen{background:#EEF3FB;color:#4A6FA0;}
.b-new{background:#EEF6FF;color:#1A6BB5;}
.b-edt{background:#FFF3E8;color:#B85C1A;}
.b-var{background:#F0EEFB;color:#6B5FA0;}
.b-pkgt{background:#F5F3EE;color:#5A5550;margin-left:3px;}
.dot{width:6px;height:6px;border-radius:50%;display:inline-block;margin-right:5px;flex-shrink:0;}
.dday{display:inline-flex;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:600;margin-left:4px;}
.dd-u{background:#FCEBEB;color:#A32D2D;}
.dd-w{background:#FEF0E6;color:#BA7517;}
.dd-o{background:#EAF3DE;color:#3B6D11;}
.asap-t{color:#993C1D;font-weight:600;font-size:12px;}

/* ─── CALENDAR ─── */
.cal-tb{display:flex;flex-direction:column;gap:10px;margin-bottom:16px;}
.cal-nav{display:flex;align-items:center;gap:12px;}
.cal-toolbar-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.cal-mo{font-size:18px;font-weight:600;color:#1C1A16;}
.cal-nb{background:#FFFFFF;border:1px solid #E8E4DC;border-radius:10px;padding:5px 11px;font-size:14px;cursor:pointer;color:#1C1A16;}
.cal-nb:hover{background:#FAF9F6;}
.cal-fs{display:flex;gap:6px;flex-wrap:wrap;}
.cal-chip{padding:4px 10px;border-radius:20px;font-size:11px;cursor:pointer;border:1px solid #E8E4DC;color:#9A9590;background:transparent;font-family:'Noto Sans KR',sans-serif;transition:all .15s;}
.cal-chip.on{background:#1C1A16;color:#fff;border-color:transparent;}
.cal-chip.blue.on{background:#185FA5;color:#fff;}
.cal-chip.amber.on{background:#BA7517;color:#fff;}
.cal-chip.green.on{background:#3B6D11;color:#fff;}
.cal-grid{background:#FFFFFF;border:1px solid #E8E4DC;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06);}
.cal-wds{display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid #E8E4DC;}
.cal-wd{padding:8px 4px;text-align:center;font-size:11px;font-weight:600;color:#9A9590;background:#FAF9F6;}
.cal-days{display:grid;grid-template-columns:repeat(7,1fr);}
.cal-day{min-height:88px;padding:6px;border-right:1px solid #E8E4DC;border-bottom:1px solid #E8E4DC;cursor:pointer;transition:background .1s;background:#FFFFFF;}
.cal-day:nth-child(7n){border-right:none;}
.cal-day:hover{background:#FAF9F6;}
.cal-day.oth{opacity:.35;}
.cal-day.tod .dn{background:#4A7C6F;color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;}
.cal-day.sel{background:#E8F0EE;}
.dn{font-size:12px;font-weight:500;margin-bottom:3px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;color:#1C1A16;}
.cal-day:nth-child(7n+1) .dn{color:#E24B4A;}
.cal-day:nth-child(7n) .dn{color:#378ADD;}
.cal-ev{padding:2px 4px;border-radius:4px;font-size:9px;font-weight:500;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cal-ev.waiting{background:#F0EFEA;color:#5F5E5A;}
.cal-ev.inprogress{background:#DDEEFF;color:#185FA5;}
.cal-ev.hold{background:#FEF3E2;color:#BA7517;}
.cal-ev.done{background:#EAF3DE;color:#3B6D11;}
.cal-more{font-size:9px;color:#9A9590;padding:1px 4px;}
.cal-day.holiday{background:#FFF5F5;}
.cal-day.holiday .dn{color:#E24B4A;}
.cal-day.has-leave{background:#EEF6FF;}
.cal-holiday-lbl{font-size:8px;color:#E24B4A;font-weight:600;padding:1px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cal-leave-lbl{font-size:8px;background:#DDEEFF;color:#185FA5;font-weight:600;padding:1px 4px;border-radius:3px;margin-bottom:1px;}
.cal-det{margin-top:14px;background:#FFFFFF;border:1px solid #E8E4DC;border-radius:14px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.06);}
.cal-det-ttl{font-size:13px;font-weight:600;margin-bottom:12px;color:#1C1A16;}
.cal-det-empty{font-size:12px;color:#9A9590;text-align:center;padding:1.5rem 0;}
.cal-tc{border:1px solid #E8E4DC;border-radius:10px;padding:10px 12px;margin-bottom:8px;background:#FFFFFF;}
.cal-tc:last-child{margin-bottom:0;}
.cal-tc-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:5px;}
.cal-tc-name{font-size:13px;font-weight:500;color:#1C1A16;}
.cal-tc-meta{display:flex;align-items:center;gap:6px;font-size:11px;color:#9A9590;flex-wrap:wrap;}

/* ─── MEETINGS ─── */
.mt-grp{margin-bottom:28px;}
.mt-dh{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
.mt-dl{flex:1;height:1px;background:#E8E4DC;}
.mt-dlbl{font-size:13px;font-weight:600;color:#5A5550;white-space:nowrap;display:flex;align-items:center;gap:8px;}
.mt-dpdf{background:none;border:1px solid #E8E4DC;border-radius:6px;padding:3px 8px;font-size:11px;color:#9A9590;cursor:pointer;font-family:'Noto Sans KR',sans-serif;}
.mt-dpdf:hover{background:#FAF9F6;}
.mt-card{background:#FFFFFF;border:1px solid #E8E4DC;border-radius:14px;padding:16px 18px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,.06);}
.mt-ch{display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #E8E4DC;flex-wrap:wrap;}
.mt-tb{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;}
.mt-meeting{background:#EEF3FB;color:#4A6FA0;}
.mt-call{background:#E8F5EE;color:#2A7A5A;}
.mt-mail{background:#FEF0E6;color:#B85C1A;}
.mt-memo{background:#F0EEFB;color:#6B5FA0;}
.mt-etc{background:#F5F3EE;color:#5A5550;}
.mt-ct{font-size:13px;font-weight:600;flex:1;color:#1C1A16;min-width:0;}
.mt-acts{display:flex;gap:6px;margin-left:auto;}
/* 회의 테이블/카드 토글 */
.mt-table-wrap{display:block;}
.mt-cards-wrap{display:none;}
.mt-tbl{width:100%;border-collapse:collapse;font-size:12px;}
.mt-tbl th{padding:6px 10px;text-align:left;font-size:11px;font-weight:600;color:#9A9590;background:#FAF9F6;border-bottom:1px solid #E8E4DC;}
.mt-tbl td{padding:7px 10px;border-bottom:1px solid #E8E4DC;vertical-align:top;color:#1C1A16;}
.mt-tbl tr:last-child td{border-bottom:none;}
.mt-tbl tr:hover td{background:#FAF9F6;}
/* 회의 모바일 카드 */
.mt-item-card{background:#FAF9F6;border:1px solid #E8E4DC;border-radius:8px;padding:10px 12px;margin-bottom:6px;}
.mt-item-card:last-child{margin-bottom:0;}
.mt-item-title{font-size:13px;font-weight:600;color:#1C1A16;margin-bottom:4px;}
.mt-item-content{font-size:12px;color:#5A5550;margin-bottom:6px;line-height:1.5;}
.mt-item-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.mt-tag{display:inline-flex;padding:1px 7px;border-radius:20px;font-size:10px;background:#E8F0EE;color:#4A7C6F;margin:1px;}
.mt-lnk{display:inline-flex;padding:1px 7px;border-radius:20px;font-size:10px;background:#F0EEFB;color:#6B5FA0;}
.mt-empty{text-align:center;padding:3rem;color:#9A9590;font-size:13px;}

/* ─── COMPLETED ─── */
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;}
.scard{background:#FFFFFF;border:1px solid #E8E4DC;border-radius:14px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.06);}
.scard-num{font-size:26px;font-weight:700;margin-bottom:4px;color:#1C1A16;}
.scard-lbl{font-size:11px;color:#9A9590;}
.scard-sub{font-size:11px;color:#9A9590;margin-top:2px;}
.bar-sec{background:#FFFFFF;border:1px solid #E8E4DC;border-radius:14px;padding:18px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,.06);}
.bar-ttl{font-size:13px;font-weight:600;margin-bottom:16px;color:#1C1A16;}
.bar-wrap{display:flex;align-items:flex-end;gap:8px;height:120px;}
.bar-col{display:flex;flex-direction:column;align-items:center;flex:1;gap:4px;}
.bar-fill{width:100%;border-radius:4px 4px 0 0;min-height:4px;}
.bar-lbl{font-size:10px;color:#9A9590;}
.bar-val{font-size:10px;font-weight:600;color:#5A5550;}

/* ─── MODAL ─── */
.ovl{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:500;padding:1rem;}
.modal{background:#FFFFFF;border-radius:20px;border:1px solid #E8E4DC;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.16);}
.modal-lg{max-width:680px;}
.mhd{padding:1.2rem 1.4rem;border-bottom:1px solid #E8E4DC;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;background:#FFFFFF;border-radius:20px 20px 0 0;}
.mhd-t{font-size:15px;font-weight:600;color:#1C1A16;}
.mhd-s{font-size:12px;color:#9A9590;margin-top:2px;}
.mbd{padding:1.2rem 1.4rem;background:#FFFFFF;}
.mft{padding:.9rem 1.4rem;border-top:1px solid #E8E4DC;display:flex;gap:8px;justify-content:flex-end;background:#FFFFFF;border-radius:0 0 20px 20px;}
.xbtn{background:none;border:none;font-size:20px;cursor:pointer;color:#9A9590;padding:0;line-height:1;}
.fg{margin-bottom:.9rem;}
.fl{font-size:12px;color:#9A9590;margin-bottom:4px;display:block;font-weight:500;}
.fi{width:100%;border:1.5px solid #D9D4C8;border-radius:10px;padding:8px 11px;font-size:13px;background:#FFFFFF;color:#1C1A16;font-family:'Noto Sans KR',sans-serif;transition:border-color .15s;}
.fi:focus{outline:none;border-color:#4A7C6F;}
.fs{width:100%;border:1.5px solid #D9D4C8;border-radius:10px;padding:8px 11px;font-size:13px;background:#FFFFFF;color:#1C1A16;font-family:'Noto Sans KR',sans-serif;}
.fta{width:100%;border:1.5px solid #D9D4C8;border-radius:10px;padding:8px 11px;font-size:13px;background:#FFFFFF;color:#1C1A16;font-family:'Noto Sans KR',sans-serif;resize:vertical;min-height:70px;}
.two{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.hban{display:flex;align-items:center;gap:8px;background:#FEF0E6;border-radius:10px;padding:8px 12px;margin-bottom:12px;font-size:12px;color:#8B3A00;}
.ss{margin-top:.75rem;}
.st{font-size:12px;font-weight:600;color:#9A9590;margin-bottom:8px;}
.si{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #E8E4DC;}
.si:last-child{border-bottom:none;}
.sc2{width:16px;height:16px;border:1.5px solid #D9D4C8;border-radius:3px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;background:#FFFFFF;}
.sc2.on{background:#4A7C6F;border-color:#4A7C6F;color:#fff;}
.sn{font-size:12px;color:#1C1A16;}
.sn.done{text-decoration:line-through;color:#9A9590;}
.step-dates{display:flex;flex-wrap:wrap;gap:4px;margin-left:auto;align-items:center;}
.step-date-tag{font-size:10px;background:#EEF6FF;color:#185FA5;padding:1px 7px;border-radius:20px;cursor:pointer;}
.step-date-tag:hover{background:#DDEEFF;}
.step-add-date{font-size:10px;color:#9A9590;cursor:pointer;background:none;border:none;font-family:'Noto Sans KR',sans-serif;padding:1px 4px;}
.step-add-date:hover{color:#4A7C6F;}
.ctr{display:flex;align-items:center;gap:12px;margin-top:8px;}
.ctr-btn{width:30px;height:30px;border:1.5px solid #D9D4C8;border-radius:8px;background:#FFFFFF;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;color:#1C1A16;}
.ctr-btn:hover{background:#FAF9F6;}
.ctr-num{font-size:20px;font-weight:700;min-width:32px;text-align:center;color:#1C1A16;}

/* ─── TOAST ─── */
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1C1A16;color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;z-index:9999;opacity:0;transition:opacity .2s;pointer-events:none;white-space:nowrap;}
.toast.show{opacity:1;}

/* ─── PRINT ─── */
@media print{
  .sb,.toast,.ovl,.mobile-tabbar{display:none!important;}
  .main{margin-left:0!important;}
  .page{padding:16px!important;}
  #print-area{display:block!important;}
}

/* ─── 태블릿 (768px ~ 1024px) ─── */
@media(max-width:1024px){
  .sg{grid-template-columns:1fr 1fr;}
}

/* ─── 모바일 (768px 이하) ─── */
@media(max-width:768px){
  /* 사이드바 숨기고 탭바 표시 */
  .sb{display:none!important;}
  .main{margin-left:0;padding-bottom:70px;}
  .page{padding:16px 14px;}

  /* 모바일 탭바 */
  .mobile-tabbar{
    display:flex;
    position:fixed;
    bottom:0;left:0;right:0;
    background:#FFFFFF;
    border-top:1px solid #E8E4DC;
    z-index:200;
    height:60px;
    box-shadow:0 -2px 12px rgba(0,0,0,.08);
  }
  .mobile-tab{
    flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:3px;border:none;background:none;cursor:pointer;
    font-family:'Noto Sans KR',sans-serif;color:#9A9590;
    transition:color .15s;padding:6px 2px;
  }
  .mobile-tab.on{color:#4A7C6F;}
  .mobile-tab-icon{font-size:20px;line-height:1;}
  .mobile-tab-label{font-size:10px;font-weight:500;}

  /* 페이지 헤더 */
  .ph{margin-bottom:16px;gap:8px;}
  .pt{font-size:18px;}

  /* 대시보드 */
  .dc{grid-template-columns:1fr;}
  .ds{grid-template-columns:1fr;}
  .dg-hello{font-size:18px;}

  /* 태스크 — 카드뷰 전환 */
  .task-table-wrap{display:none;}
  .task-cards-wrap{display:block;}
  .ttbl{border-radius:0;border-left:none;border-right:none;}

  /* 캘린더 */
  .cal-day{min-height:58px;padding:4px 3px;}
  .cal-wd{font-size:10px;padding:6px 2px;}
  .cal-ev{font-size:8px;padding:1px 3px;}
  .cal-mo{font-size:16px;}
  .cal-toolbar-right{gap:6px;}

  /* 회의록 — 카드뷰 전환 */
  .mt-table-wrap{display:none;}
  .mt-cards-wrap{display:block;}
  .mt-card{padding:12px 14px;}

  /* 완료 현황 */
  .sg{grid-template-columns:1fr 1fr;}
  .bar-wrap{height:90px;}

  /* 모달 */
  .modal{border-radius:16px;max-height:95vh;}
  .modal-lg{max-width:100%;}
  .mbd{padding:1rem;}
  .mft{padding:.75rem 1rem;}
  .two{grid-template-columns:1fr;}

  /* 유틸 */
  .hide-mobile{display:none;}
  .toast{bottom:72px;}
}
