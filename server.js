const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

/** ✅ 디렉토리 존재 확인 및 생성 */
const dir = '/app/output';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });  // 하위 폴더까지 생성
}

/** ✅ 거리 저장 API */
app.post('/save', (req, res) => {
    const distance = parseFloat(req.body.distance);
    if (isNaN(distance)) return res.status(400).send('잘못된 입력');
  
    const calories = distance * 60;
  
    // ✅ 현재 시간 문자열 추가 (ISO or toLocaleString 가능)
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  
    const log = `[${timestamp}] 거리: ${distance}km, 칼로리: ${calories}kcal\n`;
  
    fs.appendFile('/app/output/result.txt', log, (err) => {
      if (err) return res.status(500).send('저장 실패');
      res.send('저장 완료');
    });
  });

/** ✅ 로그 조회 API */
app.get('/logs', (req, res) => {
  const filePath = '/app/output/result.txt';

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.send('아직 저장된 기록이 없습니다.');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return res.status(500).send('로그를 읽을 수 없습니다.');
      res.send(data);
    });
  });
});

app.delete('/logs', (req, res) => {
    const filePath = '/app/output/result.txt';
  
    fs.writeFile(filePath, '', (err) => {
      if (err) return res.status(500).send('초기화 실패');
      res.send('기록이 초기화되었습니다.');
    });
  });

app.listen(port, () => {
  console.log(`http://localhost:${port} 에서 실행 중`);
});
