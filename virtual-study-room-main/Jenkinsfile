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
