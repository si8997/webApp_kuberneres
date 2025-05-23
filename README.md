# 파일 기반 Node.js. 웹앱의 Docker + Kubernetes 배포 보고서

## 프로젝트 개요
  사용자가 달린 거리(km)를 입력하면 그 거리를 기반으로 칼로리를 계산, 이를 서버에 파일로 저장하며, 웹에서 해당 기록 조회 및 초기화 하는 기능을 제공하는 Node.js 웹앱을 구현.
  이를 Docker 이미지로 빌드 하여 Docker Hub에 업로드 하고, Kubernetes 클러스터에 배포하여 NodePort를 통해 외부 접속 가능한 형태로 만듦

## 주요 기술 스택
  - Frontend: HTML, CSS, JavaScript
  - Backend: Node.js + Express
  - 파일 저장 방식: fs.appendFile -> /app/output/result.txt
  - Docker 이미지: amdission/runningcalculweb-app:latest
  - 저장소: Docker Hub
  - 배포 환경: Kubernetes (1 master, 1 worker)
  - 스토리지: PV (hostPath), PVC (1Gi)


## 실행 순서

    # 1. 영속 볼륨 디렉토리 생성
    sudo mkdir -p /mnt/calorie-data
    sudo chmod 777 /mnt/calorie-data

    # 2. Kubernetes 리소스 적용
    kubectl apply -f pv.yaml
    kubectl apply -f pvc.yml
    kubectl apply -f deployment.yaml
    kubectl apply -f service.yml


## deployment.yaml 예시 (중요 부분)

    containers:
      - name: runningweb-container
      image : amdission/runningcalculweb-app:latest
      ports:
        - containerPort: 3000


## nodePort 서비스 확인

    kubectl get svc runningweb-service
예시 출력:

    Name                  TYPE        CLUSTER-IP       EXTERNAL-IP    PORT(S)          AGE    
    runningweb-service    NodePort    10.109.54.80     <none>         80:30080/TCP     81m


## 접속 테스트

    curl http://192.168.56.60:30080
또는 브라우저에서:

    http://192.168.56.60:30080

주요 기능:
- "거리 입력 > 칼로리 계산"
- "결과 저장 (/app/output/result.txt)"
- "기록 보기, 기록 초기화 기능 확인"

## 결과 요약
- Docker Hub 이미지 pull 기반 배포 완료
- Kubernetes PVC/PV를 활룡한 파일 영속 저장 확인
- NodePort로 외부 서비스 접속 확인(30080 포트)
- 브라우저에서 기능 정상 동작 확인 (입력/저장/조회/초기화)

## 리소스 파일 목록
- Dokerfile
- server.js
- index.html, script.js, style.css
- pv.yaml, pvc.yaml, deploument.yaml, service.yaml


작성자: 정승인 제출일: 2025/05/28 과목: 운영체제







    

