import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidUpdate(prev) {
    if (this.state.err && prev.resetKey !== this.props.resetKey) this.setState({ err: null });
  }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="page on">
        <div className="pt">화면을 불러오지 못했어요</div>
        <div className="ps" style={{ marginTop: 8 }}>다른 메뉴는 그대로 쓸 수 있어요. 새로고침해도 같으면 알려주세요.</div>
        <pre style={{ marginTop: 16, fontSize: 11, color: '#8A8A8A', whiteSpace: 'pre-wrap' }}>{String(this.state.err && this.state.err.message)}</pre>
        <button className="btn btn-p" style={{ marginTop: 16 }} onClick={() => window.location.reload()}>새로고침</button>
      </div>
    );
  }
}
