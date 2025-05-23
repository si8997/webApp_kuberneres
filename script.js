function calculateCalories() {
    const distance = parseFloat(document.getElementById('distance').value);
    if (isNaN(distance) || distance <= 0) {
      document.getElementById('result').innerText = '올바른 거리 입력 필요';
      return;
    }
  
    const calories = distance * 60;
    document.getElementById('result').innerText = 
      `${distance}km 달리면 약 ${calories}kcal 소모됩니다.`;
  
    fetch('/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distance })
    });
  }
  
  function showLogs() {
    fetch('/logs')
      .then(res => res.text())
      .then(data => {
        document.getElementById('logs').innerText = data;
      })
      .catch(err => {
        document.getElementById('logs').innerText = '로그 불러오기 실패';
      });
  }

  function clearLogs() {
    fetch('/logs', {
      method: 'DELETE'
    })
      .then(res => res.text())
      .then(msg => {
        document.getElementById('logs').innerText = msg;
      })
      .catch(err => {
        document.getElementById('logs').innerText = '초기화 실패';
      });
  }
  
  