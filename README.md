# 파일 기반 Node.js 웹앱의 Docker + Kubernetes 배포 보고서 (Ingress 포함)

## 프로젝트 개요

사용자가 달린 거리(km)를 입력하면 그 거리를 기반으로 칼로리를 계산하고, 이를 서버에 파일로 저장하며 웹에서 해당 기록을 조회 및 초기화할 수 있는 **Node.js 기반 웹 애플리케이션**을 구현함.  
이 웹앱을 Docker 이미지로 빌드하여 Docker Hub에 업로드하고, Kubernetes 클러스터에 배포하여 **Ingress를 통한 도메인 기반 접속**까지 가능하도록 구성함.

---

## 주요 기술 스택

- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: Node.js + Express  
- **파일 저장 방식**: `fs.appendFile` → `/app/output/result.txt`  
- **Docker 이미지**: `amdission/runningcalculweb-app:latest`  
- **저장소**: Docker Hub  
- **배포 환경**: Kubernetes (1 master, 1 worker)  
- **스토리지**: PV (`hostPath`), PVC (`1Gi`)  
- **Ingress**: NGINX Ingress Controller + 도메인 매핑(`runningweb.local`)

---

## 실행 순서

### 1. 영속 볼륨 디렉토리 생성

```bash
sudo mkdir -p /mnt/calorie-data
sudo chmod 777 /mnt/calorie-data
```

### 2. Kubernetes 리소스 적용

```bash
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f runningweb-ingress.yaml
```

---

## Ingress 설정 요약

### Ingress Controller 설치

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.6/deploy/static/provider/baremetal/deploy.yaml
```

### ingress.yaml 주요 내용

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: runningweb-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: runningweb.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: runningweb-service
                port:
                  number: 80
```

### /etc/hosts 등록 (Windows 호스트)

```
127.0.0.1    runningweb.local
```

### VirtualBox 포트포워딩 설정

| 이름         | 호스트 포트 | 게스트 포트 |
|--------------|--------------|--------------|
| Ingress HTTP | 8080         | 31823        |

---

## 접속 테스트

```bash
curl -H "Host: runningweb.local" http://localhost:31823
```

또는 브라우저에서 접속:

```
http://runningweb.local:8082
```

---

## 주요 기능

- "거리 입력 → 칼로리 계산"
- 결과를 `/app/output/result.txt`에 저장
- 기록 보기, 기록 초기화 기능 제공
- 웹앱 도메인 접속: `http://runningweb.local:8080` (Ingress)

---

## 결과 요약

- Docker Hub 이미지 pull 기반으로 Kubernetes 배포 완료
- PVC/PV를 활용한 파일 영속 저장 기능 정상 동작
- NodePort와 Ingress를 통해 외부 접속 기능 구현
- VirtualBox 호스트 PC 기준 도메인(`runningweb.local`) 접속 성공
- 웹에서 입력/조회/초기화 기능 정상 작동 확인

---

## 리소스 파일 목록

- Dockerfile  
- server.js  
- index.html, script.js, style.css  
- pv.yaml, pvc.yaml  
- deployment.yaml, service.yaml  
- runningweb-ingress.yaml  

---

**작성자**: 정승인  
**제출일**: 2025/05/28  
**과목**: 운영체제


---

## Kubernetes 리소스 파일 (YAML 정리)

### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: runningweb-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: runningweb
  template:
    metadata:
      labels:
        app: runningweb
    spec:
      containers:
        - name: runningweb-container
          image: amdission/runningcalculweb-app:latest
          ports:
            - containerPort: 3000
          volumeMounts:
            - name: result-volume
              mountPath: /app/output
      volumes:
        - name: result-volume
          persistentVolumeClaim:
            claimName: calorie-pvc
```

### pvc.yaml
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: calorie-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: ""   # 💡 PV와 수동 바인딩 시 필요
```

### pv.yaml
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: calorie-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:                 # ⚠️ 로컬에서만 사용 (실습용)
    path: /mnt/calorie-data
  persistentVolumeReclaimPolicy: Retain
```

### runningweb-ingress.yaml
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: runningweb-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx   # ✅ 여기를 추가
  rules:
  - host: runningweb.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: runningweb-service
            port:
              number: 80
```

### service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: runningweb-service
spec:
  type: NodePort
  selector:
    app: runningweb
  ports:
    - port: 80
      targetPort: 3000
      nodePort: 30080
```
