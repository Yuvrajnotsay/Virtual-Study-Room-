# virtual-study-room
virtual-study-room-Website

To create a fully professional and visually appealing website that is secure, scalable, and highly available, we need to make several enhancements to the initial setup. This includes using modern web development practices, integrating Bootstrap for responsive design, and ensuring robust deployment practices.

Let's enhance the setup to include Jenkins for CI/CD, SonarQube for code quality checks, and Nexus for artifact management, alongside Docker implementation. This comprehensive setup will cover development, testing, and deployment processes, ensuring a professional and scalable deployment for the Virtual Study Room application.

### Complete Project Setup

Here's a more comprehensive setup that includes Jenkins CI/CD, SonarQube, Nexus, and Docker implementation, as well as Kubernetes for deployment:

#### Project Structure
```plaintext
virtual-study-room/
├── backend/
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── Dockerfile
│   ├── public/
│   │   ├── index.html
│   └── src/
│       ├── App.js
│       ├── index.css
│       ├── components/
│       │   ├── Header.js
│       │   ├── Room.js
│       │   └── Footer.js
│       ├── pages/
│       │   ├── Home.js
│       │   ├── Room.js
│       │   └── NotFound.js
│       ├── services/
│       │   └── api.js
│       ├── index.js
│       └── package.json
├── Jenkinsfile
├── sonar-project.properties
├── deployment.yaml
└── service.yaml
```

### Backend Enhancements

**`backend/package.json`**
```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "Backend for Virtual Study Room",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.17.1",
    "socket.io": "^4.0.0",
    "mongoose": "^5.12.13"
  }
}
```

**`backend/Dockerfile`**
```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
```

### Frontend Enhancements

**`frontend/package.json`**
```json
{
  "name": "frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-router-dom": "^5.2.0",
    "react-scripts": "4.0.3",
    "bootstrap": "^5.0.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

**`frontend/Dockerfile`**
```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "build"]
```

### Jenkins Configuration

**`Jenkinsfile`**
```groovy
pipeline {
  agent any  // Specifies that this pipeline can run on any available agent (Jenkins node).

  environment {  // Defines environment variables accessible within the pipeline.
    DOCKER_CREDENTIALS_ID = 'dockerhub'  // ID of the Docker Hub credentials stored in Jenkins.
    SONARQUBE_URL = 'http://localhost:9000'  // URL of the SonarQube server for code analysis.
    SONARQUBE_TOKEN = credentials('sonarqube-token')  // Access token for SonarQube authentication.
    NEXUS_URL = 'http://localhost:8081'  // URL of the Nexus repository manager for artifact storage.
    NEXUS_CREDENTIALS_ID = 'nexus'  // ID of the Nexus credentials stored in Jenkins.
    IMAGE_NAME_FRONTEND = 'yourusername/frontend'  // Docker image name for the frontend.
    IMAGE_NAME_BACKEND = 'yourusername/backend'  // Docker image name for the backend.
  }

  stages {  // Defines the stages of the pipeline.
    stage('Checkout') {  // Checkout stage to clone the repository.
      steps {
        git 'https://github.com/yourusername/virtual-study-room.git'  // Clones the Git repository.
      }
    }

    stage('SonarQube Analysis') {  // SonarQube analysis stage for code quality checks.
      steps {
        script {  // Allows execution of Groovy script within the pipeline.
          def scannerHome = tool 'SonarQubeScanner'  // Retrieves the SonarQube scanner tool configured in Jenkins.
          withSonarQubeEnv('SonarQube') {  // Sets up SonarQube environment.
            sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=virtual-study-room"  // Executes SonarQube scanner command with project key.
          }
        }
      }
    }

    stage('Build Docker Images') {  // Docker image build stage.
      steps {
        script {
          docker.withRegistry('', DOCKER_CREDENTIALS_ID) {  // Authenticates with Docker Hub using provided credentials.
            sh 'cd frontend && docker build -t ${IMAGE_NAME_FRONTEND} .'  // Builds Docker image for frontend.
            sh 'cd backend && docker build -t ${IMAGE_NAME_BACKEND} .'  // Builds Docker image for backend.
          }
        }
      }
    }

    stage('Push to Nexus') {  // Push Docker images to Nexus stage.
      steps {
        script {
          docker.withRegistry(NEXUS_URL, NEXUS_CREDENTIALS_ID) {  // Authenticates with Nexus using provided credentials.
            sh 'docker tag ${IMAGE_NAME_FRONTEND} nexus-repo:8081/frontend'  // Tags frontend Docker image.
            sh 'docker push nexus-repo:8081/frontend'  // Pushes frontend Docker image to Nexus.
            sh 'docker tag ${IMAGE_NAME_BACKEND} nexus-repo:8081/backend'  // Tags backend Docker image.
            sh 'docker push nexus-repo:8081/backend'  // Pushes backend Docker image to Nexus.
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {  // Deployment stage to Kubernetes.
      steps {
        // Apply deployment configuration
        sh 'kubectl apply -f deployment.yaml'

        // Apply service configuration
        sh 'kubectl apply -f service.yaml'
      }
    }
  }
}
```

### SonarQube Configuration

**`sonar-project.properties`**
```properties
sonar.projectKey=virtual-study-room
sonar.projectName=Virtual Study Room
sonar.projectVersion=1.0
sonar.sourceEncoding=UTF-8
sonar.sources=frontend/src,backend
sonar.language=js
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### Kubernetes Configuration

**`deployment.yaml`**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: nexus-repo:8081/frontend
        ports:
        - containerPort: 5000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: nexus-repo:8081/backend
        ports:
        - containerPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongo-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongo
  template:
    metadata:
      labels:
        app: mongo
    spec:
      containers:
      - name: mongo
        image: mongo:4.4
        ports:
        - containerPort: 27017
```

**`service.yaml`**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: LoadBalancer
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 8080
    targetPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: mongo-service
spec:
  type: ClusterIP
  selector:
    app: mongo
  ports:
  - protocol: TCP
    port: 27017
    targetPort: 27017
```

### Setting Up Jenkins, SonarQube, and Nexus

1. **Jenkins Setup**:
   - Install Jenkins on your server.
   - Install required plugins: Docker, GitHub, Kubernetes, SonarQube Scanner, Nexus Artifact Uploader.

2. **SonarQube Setup**:
   - Install and run SonarQube:
     ```sh
     docker run -d --name sonarqube -p 9000:9000 sonarqube
     ```
   - Generate a token in SonarQube for Jenkins integration.

3. **Nexus Setup**:
   - Install and run Nexus:
     ```sh
     docker run -d -p 8081:8081 --name nexus sonatype/nexus3
     ```
   - Set up Docker repository in Nexus.
    ```sh
     docker exec -it nexus cat /nexus-data/admin.password
    ```
4. **Docker Setup**:
   - Ensure Docker is installed on your Jenkins server.

5. **Kubernetes and EKS Setup**:
   - Create an EKS cluster using AWS Management Console or AWS CLI.
   - Configure `kubectl` to interact with your EKS cluster.

By following these detailed steps and configurations, you will have a highly professional, secure, and scalable Virtual Study Room application. This setup ensures code quality with SonarQube, manages artifacts with Nexus, and automates the CI/CD pipeline with Jenkins, deploying seamlessly to an EKS cluster.
---------------------------
***We can set up Kubernetes on your Ubuntu server in Google Cloud Platform (GCP) and then configure EKS (Amazon Elastic Kubernetes Service) to deploy your application:***

### Kubernetes Setup on GCP Ubuntu Server

1. **Create an Ubuntu Server Instance on GCP**:
   - Log in to your Google Cloud Platform console.
   - Navigate to Compute Engine > VM instances.
   - Click on "Create Instance".
   - Choose Ubuntu as the operating system.
   - Configure your instance with appropriate resources and networking settings.

2. **Install Docker**:
   - SSH into your Ubuntu server instance.
   - Install Docker using the following commands:
     ```sh
     sudo apt update
     sudo apt install -y docker.io
     sudo systemctl enable --now docker
     ```

3. **Install `kubectl`**:
   - Run the following commands to install `kubectl`:
     ```sh
     sudo apt-get update && sudo apt-get install -y apt-transport-https
     curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
     echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
     sudo apt-get update
     sudo apt-get install -y kubectl
     ```

4. **Install `kubeadm` and `kubelet`** (optional, if you plan to create a Kubernetes cluster):
   - Install `kubeadm` and `kubelet`:
     ```sh
     sudo apt-get update && sudo apt-get install -y apt-transport-https curl
     curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
     echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
     sudo apt-get update
     sudo apt-get install -y kubelet kubeadm kubectl
     sudo apt-mark hold kubelet kubeadm kubectl
     ```

5. **Initialize Kubernetes Cluster** (optional):
   - Run `kubeadm init` to initialize a Kubernetes cluster.
   - Follow the instructions provided by `kubeadm` to set up your cluster.

### Configuration of EKS (Amazon Elastic Kubernetes Service)

Since you're using GCP for your Ubuntu server and EKS is an AWS service, you can't directly use EKS on your current infrastructure. However, you have a couple of options:

1. **Use Amazon EC2**:
   - Set up an Amazon EC2 instance running Ubuntu on AWS.
   - Follow the steps mentioned above to install Docker and `kubectl`.
   - You can then use `kubectl` to interact with your EKS cluster once it's set up.

2. **Use a Managed Kubernetes Service on GCP**:
   - Google Cloud Platform provides its own managed Kubernetes service called Google Kubernetes Engine (GKE).
   - You can create a Kubernetes cluster on GKE and deploy your application there instead of using EKS.

For simplicity and integration with your existing infrastructure, I recommend option 2: using Google Kubernetes Engine (GKE). This way, you can manage all your resources within GCP and have better integration between your services. However, if you prefer to use EKS or have specific reasons to do so, you can follow option 1.

Got it! Since you're using Google Cloud Platform (GCP) and not AWS, you can set up Kubernetes directly on your GCP Ubuntu server. Here's how you can do it:

### Kubernetes Setup on GCP Ubuntu Server

1. **Create an Ubuntu Server Instance on GCP**:
   - Log in to your Google Cloud Platform console.
   - Navigate to Compute Engine > VM instances.
   - Click on "Create Instance".
   - Choose Ubuntu as the operating system.
   - Configure your instance with appropriate resources and networking settings.

2. **Install Docker**:
   - SSH into your Ubuntu server instance.
   - Update the package index:
     ```sh
     sudo apt update
     ```
   - Install Docker:
     ```sh
     sudo apt install -y docker.io
     ```
   - Start and enable Docker:
     ```sh
     sudo systemctl enable --now docker
     ```

3. **Install `kubectl`**:
   - Run the following commands to install `kubectl`:
     ```sh
     sudo apt-get update && sudo apt-get install -y apt-transport-https gnupg2 curl
     curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
     echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
     sudo apt-get update
     sudo apt-get install -y kubectl
     ```

4. **Install `kubeadm` and `kubelet`**:
   - Install `kubeadm` and `kubelet`:
     ```sh
     sudo apt-get update && sudo apt-get install -y apt-transport-https curl
     curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
     echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
     sudo apt-get update
     sudo apt-get install -y kubelet kubeadm
     sudo apt-mark hold kubelet kubeadm
     ```

5. **Initialize Kubernetes Cluster**:
   - Run `kubeadm init` to initialize a Kubernetes cluster.
   - Follow the instructions provided by `kubeadm` to set up your cluster.
   - After the initialization, you'll see a command to join nodes to the cluster. Save this command as you'll need it when adding additional nodes.

6. **Set Up Kubernetes Networking (Optional)**:
   - Choose a networking solution for your Kubernetes cluster. Popular choices include Calico, Flannel, and Weave.
   - Follow the installation instructions provided by the chosen networking solution.

7. **Join Worker Nodes (Optional)**:
   - If you have additional Ubuntu server instances that you want to join to the Kubernetes cluster as worker nodes, SSH into each node and run the `kubeadm join` command obtained from the initialization step.

Once you've completed these steps, you'll have a Kubernetes cluster set up on your GCP Ubuntu server. You can now deploy your applications and manage them using `kubectl`.

-------------

To install and set up Kubernetes manually on your GCP Ubuntu instance, you can follow these steps:

### 1. Install Docker

First, install Docker, as Kubernetes uses Docker to manage containers.

```sh
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce
```

### 2. Install kubeadm, kubelet, and kubectl

Add the Kubernetes APT repository and install the required packages.

```sh
sudo apt-get update && sudo apt-get install -y apt-transport-https curl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee -a /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

### 3. Disable Swap

Kubernetes requires that swap be disabled.

```sh
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
```

### 4. Initialize the Kubernetes Cluster

Initialize the Kubernetes cluster on the master node. This command will also print a command to join worker nodes to the cluster.

```sh
sudo kubeadm init --pod-network-cidr=10.244.0.0/16
```

### 5. Set Up kubeconfig for the Default User

To start using your cluster, you need to set up the kubeconfig file.

```sh
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### 6. Install a Pod Network Add-on

For the nodes to communicate, you need to install a pod network add-on. Here, we use Flannel.

```sh
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

### 7. Join Worker Nodes

If you have additional nodes to join, run the `kubeadm join` command printed during the kubeadm init process on those nodes. If you missed it, you can get the command again by running the following on the master node:

```sh
kubeadm token create --print-join-command
```

### 8. Verify the Cluster

Check the status of the nodes and pods:

```sh
kubectl get nodes
kubectl get pods --all-namespaces
```

### 9. Deploy Your Application

Now that your Kubernetes cluster is up and running, you can deploy your application. Modify your Jenkins pipeline to deploy to this manually set up Kubernetes cluster.

#### Update Your Jenkinsfile

Update the `Deploy to GCP Kubernetes` stage to use the manually set up Kubernetes cluster:

```groovy
pipeline {
  agent any  // Specifies that this pipeline can run on any available agent (Jenkins node).

  environment {  // Defines environment variables accessible within the pipeline.
    DOCKER_CREDENTIALS_ID = 'dockerhub'  // ID of the Docker Hub credentials stored in Jenkins.
    SONARQUBE_URL = 'http://localhost:9000'  // URL of the SonarQube server for code analysis.
    SONARQUBE_TOKEN = credentials('sonarqube-token')  // Access token for SonarQube authentication.
    NEXUS_URL = 'http://localhost:8081'  // URL of the Nexus repository manager for artifact storage.
    NEXUS_CREDENTIALS_ID = 'nexus'  // ID of the Nexus credentials stored in Jenkins.
    IMAGE_NAME_FRONTEND = 'yourusername/frontend'  // Docker image name for the frontend.
    IMAGE_NAME_BACKEND = 'yourusername/backend'  // Docker image name for the backend.
  }

  stages {  // Defines the stages of the pipeline.
    stage('Checkout') {  // Checkout stage to clone the repository.
      steps {
        git 'https://github.com/yourusername/virtual-study-room.git'  // Clones the Git repository.
      }
    }

    stage('SonarQube Analysis') {  // SonarQube analysis stage for code quality checks.
      steps {
        script {  // Allows execution of Groovy script within the pipeline.
          def scannerHome = tool 'SonarQubeScanner'  // Retrieves the SonarQube scanner tool configured in Jenkins.
          withSonarQubeEnv('SonarQube') {  // Sets up SonarQube environment.
            sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=virtual-study-room"  // Executes SonarQube scanner command with project key.
          }
        }
      }
    }

    stage('Build Docker Images') {  // Docker image build stage.
      steps {
        script {
          docker.withRegistry('', DOCKER_CREDENTIALS_ID) {  // Authenticates with Docker Hub using provided credentials.
            sh 'cd frontend && docker build -t ${IMAGE_NAME_FRONTEND} .'  // Builds Docker image for frontend.
            sh 'cd backend && docker build -t ${IMAGE_NAME_BACKEND} .'  // Builds Docker image for backend.
          }
        }
      }
    }

    stage('Push to Nexus') {  // Push Docker images to Nexus stage.
      steps {
        script {
          docker.withRegistry(NEXUS_URL, NEXUS_CREDENTIALS_ID) {  // Authenticates with Nexus using provided credentials.
            sh 'docker tag ${IMAGE_NAME_FRONTEND} nexus-repo:8081/frontend'  // Tags frontend Docker image.
            sh 'docker push nexus-repo:8081/frontend'  // Pushes frontend Docker image to Nexus.
            sh 'docker tag ${IMAGE_NAME_BACKEND} nexus-repo:8081/backend'  // Tags backend Docker image.
            sh 'docker push nexus-repo:8081/backend'  // Pushes backend Docker image to Nexus.
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {  // Deployment stage to Kubernetes.
      steps {
        // Apply deployment configuration
        sh 'kubectl apply -f deployment.yaml'

        // Apply service configuration
        sh 'kubectl apply -f service.yaml'
      }
    }
  }
}
```

This pipeline script assumes that your Jenkins agent has `kubectl` installed and configured to access your Kubernetes cluster. The deployment and service YAML files should be properly configured to deploy your application.

-------

When setting up a Kubernetes cluster manually on a GCP Ubuntu server, you do not need to create a Kubernetes cluster in the GCP console. Instead, you will manually install and configure Kubernetes on your virtual machines (VMs). Here’s a detailed guide on how to manually set up a Kubernetes cluster on a GCP Ubuntu server:

### Prerequisites
1. **GCP Account and Project:** Ensure you have a Google Cloud Platform account and a project set up.
2. **Ubuntu VM:** You should have one or more Ubuntu VMs set up on GCP.

### Steps to Set Up Kubernetes Manually

#### 1. Provision Ubuntu VMs
Create a few VMs on GCP. One VM will act as the master node, and the other VMs will be worker nodes. Ensure each VM meets the minimum hardware requirements for running Kubernetes.

#### 2. SSH into the Master Node

Connect to your master node using SSH.

```sh
gcloud compute ssh <your-master-node>
```

#### 3. Install Docker on All Nodes

```sh
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce
sudo systemctl enable docker
sudo systemctl start docker
```

#### 4. Install Kubernetes Components (kubelet, kubeadm, kubectl) on All Nodes

Add the Kubernetes repository:

```sh
sudo apt-get update && sudo apt-get install -y apt-transport-https curl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
```

Install `kubelet`, `kubeadm`, and `kubectl`:

```sh
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

#### 5. Disable Swap on All Nodes

```sh
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
```

#### 6. Initialize the Master Node

On the master node, initialize the Kubernetes cluster:

```sh
sudo kubeadm init --pod-network-cidr=10.244.0.0/16
```

Set up the kubeconfig for the default user:

```sh
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

#### 7. Install a Pod Network Add-on

Using Flannel as an example:

```sh
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

#### 8. Join Worker Nodes to the Cluster

On each worker node, run the command given by `kubeadm init` on the master node. It looks something like this:

```sh
sudo kubeadm join <master-ip>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>
```

You can retrieve the join command from the master node if you did not save it:

```sh
kubeadm token create --print-join-command
```

#### 9. Verify the Cluster

On the master node, check the status of the nodes:

```sh
kubectl get nodes
```

This should list all your nodes (master and workers) with the status "Ready".

### Summary

By following these steps, you manually set up a Kubernetes cluster on your GCP Ubuntu VMs without using GKE. This setup allows you to have full control over your Kubernetes environment. If you encounter any issues or need further assistance, feel free to ask!
