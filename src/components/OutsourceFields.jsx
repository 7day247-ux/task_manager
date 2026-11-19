import React from 'react';
import Icon from './Icon';
import { OUT_APPROVAL, OUT_ITEMS } from '../utils/constants';
import { today } from '../utils/helpers';
import { lineTotals, won } from '../utils/outsource';

export const EMPTY_ORDER = {
  vendor: '', product_ids: [], kind: '', lines: [], first_draft_date: '', final_due_date: '',
  contact: '', approval: '작성 전', approval_date: '', memo: '',
};

// 태스크 수정 창 안에서 외주 정보(업체·제품·비용·일정·품의 상태)를 고친다
export default function OutsourceFields({ value, onChange, products, onOpenDoc }) {
  const o = value;
  const set = (k, v) => onChange({ ...o, [k]: v });
  const pById = new Map(products.map(p => [String(p.id), p]));
  const chosen = o.product_ids.map(id => pById.get(String(id))).filter(Boolean);
  const { rows, sum } = lineTotals(o.lines);

  function addProduct(id) {
    if (!id || o.product_ids.map(String).includes(String(id))) return;
    const p = pById.get(String(id));
    // 외박스는 기본으로 같이 넣는다
    const lines = [...o.lines, { label: p.name, item: '포장', price: '' }, { label: p.name, item: '외박스', price: '' }];
    onChange({ ...o, product_ids: [...o.product_ids, Number(id)], lines });
  }
  function removeProduct(id) {
    const p = pById.get(String(id));
    onChange({
      ...o,
      product_ids: o.product_ids.filter(x => String(x) !== String(id)),
      lines: o.lines.filter(l => !p || l.label !== p.name),
    });
  }
  function addLine(label, item) {
    set('lines', [...o.lines, { label, item, price: '' }]);
  }
  function setLine(i, k, v) {
    set('lines', o.lines.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  }
  function setApproval(a) {
    onChange({ ...o, approval: a, approval_date: a === '작성 전' ? '' : (a === o.approval ? o.approval_date : today()) });
  }

  return (
    <div className="of">
      <div className="of-hd"><Icon name="handshake" size={15} /> 외주 정보</div>
      <div className="two">
        <div className="fg">
          <label className="fl" htmlFor="of-vendor">디자인 업체</label>
          <input id="of-vendor" className="fi" value={o.vendor} placeholder="디자인 파이브" onChange={e => set('vendor', e.target.value)} />
        </div>
        <div className="fg">
          <label className="fl" htmlFor="of-contact">업체 컨택 (마케터)</label>
          <input id="of-contact" className="fi" value={o.contact} placeholder="담당 마케터" onChange={e => set('contact', e.target.value)} />
        </div>
      </div>

      <div className="fg">
        <label className="fl" htmlFor="of-prod">디자인 제품</label>
        {chosen.length > 0 && (
          <div className="of-chips">
            {chosen.map(p => (
              <span key={p.id} className="of-chip">
                {p.name}
                <button type="button" onClick={() => removeProduct(p.id)} aria-label={p.name + ' 빼기'}><Icon name="x" size={12} /></button>
              </span>
            ))}
          </div>
        )}
        <select id="of-prod" className="fs" value="" onChange={e => addProduct(e.target.value)}>
          <option value="">+ 제품 추가</option>
          {products.filter(p => !o.product_ids.map(String).includes(String(p.id))).map(p => (
            <option key={p.id} value={p.id}>{p.name}{p.line ? ' · ' + p.line : ''}</option>
          ))}
        </select>
      </div>

      <div className="fg">
        <label className="fl" htmlFor="of-kind">디자인 종류</label>
        <input id="of-kind" className="fi" value={o.kind} placeholder="아이스크림 바 포장, 외박스 / 젤리 파우치, 볼케이스"
          onChange={e => set('kind', e.target.value)} />
      </div>

      <div className="fg">
        <label className="fl">비용 {sum.total > 0 && <span className="it-sum">총 {won(sum.total)}</span>}</label>
        {rows.length > 0 && (
          <div className="of-lines">
            {rows.map((l, i) => (
              <div key={i} className="of-line">
                <div className="of-line-t">
                  <input className="fi" value={l.label} aria-label="제품" onChange={e => setLine(i, 'label', e.target.value)} />
                  <input className="fi" value={l.item} aria-label="품목" onChange={e => setLine(i, 'item', e.target.value)} />
                  <button type="button" className="pd-x" onClick={() => set('lines', o.lines.filter((_, idx) => idx !== i))} aria-label="품목 삭제"><Icon name="x" size={14} /></button>
                </div>
                <div className="of-line-b">
                  <input className="fi" inputMode="numeric" placeholder="단가 (VAT 별도)" aria-label="단가"
                    value={l.price === '' || l.price == null ? '' : Number(l.price).toLocaleString('ko-KR')}
                    onChange={e => setLine(i, 'price', e.target.value.replace(/[^0-9]/g, ''))} />
                  <span className="of-calc">VAT {won(l.vat)} · 계 <b>{won(l.total)}</b></span>
                </div>
              </div>
            ))}
            <div className="of-sum">
              <span>공급가 {won(sum.price)}</span><span>VAT {won(sum.vat)}</span><b>총계 {won(sum.total)}</b>
            </div>
          </div>
        )}
        <div className="of-add">
          {(chosen.length ? chosen.map(p => p.name) : ['']).map(name => (
            <div key={name || 'x'} className="of-add-row">
              {name && <span className="of-add-l">{name}</span>}
              {OUT_ITEMS.map(it => (
                <button type="button" key={it} className="btn btn-sm" onClick={() => addLine(name, it)}>+ {it}</button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="two">
        <div className="fg">
          <label className="fl" htmlFor="of-first">1차 시안 수령일</label>
          <input id="of-first" className="fi" type="date" value={o.first_draft_date} onChange={e => set('first_draft_date', e.target.value)} />
        </div>
        <div className="fg">
          <label className="fl" htmlFor="of-final">최종 파일 인쇄소 마감</label>
          <input id="of-final" className="fi" type="date" value={o.final_due_date} onChange={e => set('final_due_date', e.target.value)} />
        </div>
      </div>

      <div className="fg">
        <span className="fl">품의서</span>
        <div className="pd-stat-row">
          {OUT_APPROVAL.map(a => (
            <button type="button" key={a} className={'pd-stat' + (o.approval === a ? ' on' : '')} onClick={() => setApproval(a)}>{a}</button>
          ))}
        </div>
        {o.approval_date && <div className="fhint">{o.approval} · {o.approval_date.slice(5).replace('-', '.')}</div>}
      </div>

      <div className="fg">
        <label className="fl" htmlFor="of-memo">외주 메모</label>
        <textarea id="of-memo" className="fta" value={o.memo} placeholder="의뢰 배경, 일정 사유 등 (품의서 비고에 들어가요)" onChange={e => set('memo', e.target.value)} />
      </div>

      {onOpenDoc ? (
        <button type="button" className="btn" onClick={onOpenDoc}><Icon name="file" size={14} /> 품의서 보기 · 복사 · 인쇄</button>
      ) : (
        <div className="fhint">저장한 뒤 다시 열면 품의서를 만들 수 있어요.</div>
      )}
    </div>
  );
}
