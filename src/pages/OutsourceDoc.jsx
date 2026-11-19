import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { lineTotals, won, fmtKDate, productNames, docText } from '../utils/outsource';

// 외주 품의서: 화면에서 확인 → 텍스트 복사(그룹웨어 붙여넣기) 또는 인쇄
export default function OutsourceDoc({ tasks, orders, products, onOpenTask, showToast, hideToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = tasks.find(t => String(t.id) === String(id));
  const order = orders.find(o => String(o.task_id) === String(id));

  function back() {
    if (window.history.length > 1) navigate(-1);
    else navigate('/tasks');
  }

  if (!task || !order) {
    return (
      <div className="page on od">
        <button className="pd-back" onClick={back}><Icon name="back" size={18} /> 뒤로</button>
        <div className="mt-empty">{tasks.length ? '외주 정보를 찾을 수 없어요.' : '불러오는 중…'}</div>
      </div>
    );
  }

  const { rows, sum } = lineTotals(order.lines);
  const names = productNames(order, products);
  const missing = [
    !order.vendor && '업체',
    !names.length && '제품',
    !rows.length && '비용 품목',
    rows.some(r => !r.priceNum) && '단가',
    !order.first_draft_date && '1차 시안 수령일',
  ].filter(Boolean);

  async function copy() {
    const text = docText(order, products);
    try {
      await navigator.clipboard.writeText(text);
      showToast('복사했어요');
      setTimeout(hideToast, 1500);
    } catch {
      window.prompt('아래 내용을 복사해 주세요', text);
    }
  }

  function printDoc() {
    const area = document.getElementById('print-area');
    if (area) area.innerHTML = ''; // 다른 화면에서 인쇄했던 내용이 같이 나오지 않게
    window.print();
  }

  let n = 6;
  return (
    <div className="page on od">
      <div className="od-tools">
        <button className="pd-back" onClick={back}><Icon name="back" size={18} /> 뒤로</button>
        <div className="od-btns">
          <button className="btn" onClick={() => onOpenTask(task.id)}><Icon name="edit" size={14} /> 수정</button>
          <button className="btn" onClick={copy}><Icon name="copy" size={14} /> 텍스트 복사</button>
          <button className="btn btn-p" onClick={printDoc}><Icon name="printer" size={14} /> 인쇄</button>
        </div>
      </div>
      {missing.length > 0 && (
        <div className="od-warn"><Icon name="alert" size={14} /> 아직 비어 있어요: {missing.join(', ')}</div>
      )}

      <article className="od-paper">
        <h1 className="od-title">디자인 외주 의뢰 품의</h1>
        <p className="od-lead">아래와 같이 디자인 외주를 의뢰하고자 하오니 검토 후 결재 바랍니다.</p>
        <div className="od-below">- 아 래 -</div>
        <ol className="od-list">
          <li><span className="od-k">1. 디자인 업체</span><span className="od-v">{order.vendor || '　'}</span></li>
          <li><span className="od-k">2. 디자인 제품</span><span className="od-v">{names.join(', ') || '　'}</span></li>
          <li><span className="od-k">3. 디자인 종류</span><span className="od-v">{order.kind || '　'}</span></li>
          <li className="od-cost">
            <span className="od-k">4. 비용</span>
            <table className="od-tbl">
              <thead><tr><th>구분</th><th>품목</th><th>단가</th><th>VAT</th><th>총계</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td className="od-l">{[r.label, r.item].filter(Boolean).join(' ')}</td>
                    <td>{r.priceNum ? won(r.priceNum) : ''}</td>
                    <td>{r.priceNum ? won(r.vat) : ''}</td>
                    <td>{r.priceNum ? won(r.total) : ''}</td>
                  </tr>
                ))}
                {!rows.length && <tr><td>1</td><td /><td /><td /><td /></tr>}
              </tbody>
              <tfoot><tr><td colSpan={2}>합계</td><td>{won(sum.price)}</td><td>{won(sum.vat)}</td><td>{won(sum.total)}</td></tr></tfoot>
            </table>
            <span className="od-note">단가는 VAT 별도 기준</span>
          </li>
          <li><span className="od-k">5. 1차 시안 수령일</span><span className="od-v">{fmtKDate(order.first_draft_date) || '　'}</span></li>
          {order.final_due_date && <li><span className="od-k">{n++}. 최종 데이터 인쇄소 전달</span><span className="od-v">{fmtKDate(order.final_due_date)}</span></li>}
          {order.memo && <li><span className="od-k">{n++}. 비고</span><span className="od-v">{order.memo}</span></li>}
        </ol>
        <div className="od-end">끝.</div>
      </article>
    </div>
  );
}
