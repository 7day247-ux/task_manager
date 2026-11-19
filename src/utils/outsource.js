// 외주 비용 계산과 품의서 문구

const WD = ['일', '월', '화', '수', '목', '금', '토'];

export function won(n) {
  return (Math.round(Number(n) || 0)).toLocaleString('ko-KR') + '원';
}

// 단가는 VAT 별도로 적고, VAT는 10%
export function lineTotals(lines = []) {
  const rows = lines.map(l => {
    const price = Number(l.price) || 0;
    const vat = Math.round(price * 0.1);
    return { ...l, priceNum: price, vat, total: price + vat };
  });
  const sum = rows.reduce((a, r) => ({ price: a.price + r.priceNum, vat: a.vat + r.vat, total: a.total + r.total }), { price: 0, vat: 0, total: 0 });
  return { rows, sum };
}

export function fmtKDate(d) {
  if (!d) return '';
  const t = new Date(d + 'T00:00:00');
  if (isNaN(t)) return d;
  return `${t.getFullYear()}. ${t.getMonth() + 1}. ${t.getDate()}.(${WD[t.getDay()]})`;
}

export function productNames(order, products) {
  const byId = new Map(products.map(p => [String(p.id), p.name]));
  return (order.product_ids || []).map(id => byId.get(String(id))).filter(Boolean);
}

// 그룹웨어 결재 양식에 붙여 넣을 텍스트
export function docText(order, products) {
  const { rows, sum } = lineTotals(order.lines);
  const names = productNames(order, products);
  const out = [];
  out.push('제목: 디자인 외주 의뢰 품의' + (order.vendor ? ` (${order.vendor})` : ''));
  out.push('');
  out.push('아래와 같이 디자인 외주를 의뢰하고자 하오니 검토 후 결재 바랍니다.');
  out.push('');
  out.push('- 아 래 -');
  out.push('');
  out.push(`1. 디자인 업체: ${order.vendor || ''}`);
  out.push(`2. 디자인 제품: ${names.join(', ')}`);
  out.push(`3. 디자인 종류: ${order.kind || ''}`);
  out.push('4. 비용 (VAT 별도 단가 기준)');
  out.push(['구분', '품목', '단가', 'VAT', '총계'].join('\t'));
  rows.forEach((r, i) => {
    out.push([i + 1, [r.label, r.item].filter(Boolean).join(' '), won(r.priceNum), won(r.vat), won(r.total)].join('\t'));
  });
  out.push(['합계', '', won(sum.price), won(sum.vat), won(sum.total)].join('\t'));
  out.push(`5. 1차 시안 수령일: ${fmtKDate(order.first_draft_date)}`);
  let n = 6;
  if (order.final_due_date) out.push(`${n++}. 최종 데이터 인쇄소 전달: ${fmtKDate(order.final_due_date)}`);
  if (order.memo) out.push(`${n++}. 비고: ${order.memo}`);
  out.push('');
  out.push('끝.');
  return out.join('\n');
}
