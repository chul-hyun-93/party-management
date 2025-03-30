// pages/index.js

import React, { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nickname || !message) {
      alert('닉네임과 메시지를 모두 입력해주세요.');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch('/api/party', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, message }),
      });
      
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Error sending message:', error);
      setResponse({ error: '요청 처리 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>AI 파티 관리 시스템</title>
        <meta name="description" content="AI를 활용한 파티 관리 시스템" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">AI 파티 관리 시스템</h1>
        
        <p className="description">
          파티 참가, 탈퇴, 생성을 자연어로 요청하세요!
        </p>
        
        <div className="examples">
          <h3>사용 예시:</h3>
          <ul>
            <li>"레이드 파티에 참가할게요" - 파티 참가</li>
            <li>"던전 파티에서 나갈게요" - 파티 탈퇴</li>
            <li>"보스전 파티 만들어주세요" - 파티 생성</li>
          </ul>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>닉네임:</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>메시지:</label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="예: OO 파티에 참가할게요"
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? '처리 중...' : '전송'}
            </button>
          </form>
        </div>

        {response && (
          <div className="response">
            <h3>결과:</h3>
            <div className="response-card">
              <p className={response.success ? 'success' : 'error'}>
                {response.message || response.error}
              </p>
              
              {response.currentParties && (
                <div className="parties">
                  <h4>현재 파티 목록:</h4>
                  {Object.keys(response.currentParties).length === 0 ? (
                    <p>파티가 없습니다.</p>
                  ) : (
                    <ul>
                      {Object.entries(response.currentParties).map(([partyName, members]) => (
                        <li key={partyName}>
                          <strong>{partyName}</strong>: {members.join(', ')}
                          <span className="member-count">({members.length}명)</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 800px;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
        }

        .description {
          text-align: center;
          line-height: 1.5;
          font-size: 1.5rem;
          margin: 1rem 0;
        }

        .examples {
          width: 100%;
          margin: 2rem 0;
          padding: 1.5rem;
          border-radius: 10px;
          background-color: #f0f0f0;
        }

        .examples h3 {
          margin-top: 0;
        }

        .card {
          width: 100%;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          margin: 1rem 0;
        }

        .form-group {
          margin-bottom: 1rem;
          width: 100%;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }

        input {
          width: 100%;
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        button {
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        button:hover {
          background-color: #0051a2;
        }

        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .response {
          width: 100%;
          margin-top: 2rem;
        }

        .response-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }

        .success {
          color: #2e7d32;
        }

        .error {
          color: #d32f2f;
        }

        .parties {
          margin-top: 1.5rem;
        }

        .parties ul {
          list-style-type: none;
          padding: 0;
        }

        .parties li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }

        .member-count {
          margin-left: 0.5rem;
          color: #666;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          background-color: #f7f7f7;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}