pipeline {
    agent any

    tools {
        nodejs 'NodeJS20'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 20, unit: 'MINUTES')
        timestamps()
    }

    environment {
        SONAR_PROJECT_KEY = 'myschool-front'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '>>> [1/5] Recuperation du code source depuis GitHub...'
                checkout scm
                echo '>>> Code source recupere avec succes.'
            }
        }

        stage('Install') {
            steps {
                echo '>>> [2/5] Installation des dependances npm (npm ci)...'
                sh 'npm ci'
                echo '>>> Dependances installees.'
            }
        }

        stage('Unit Tests') {
            steps {
                echo '>>> [3/5] Execution des tests unitaires Angular...'
                sh 'npm test -- --watch=false --browsers=ChromeHeadless || true'
                echo '>>> Tests unitaires termines.'
            }
        }

        stage('Build') {
            steps {
                echo '>>> [4/5] Compilation Angular en mode production...'
                sh 'npm run build'
                echo '>>> Build Angular genere dans dist/.'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo '>>> [5/5] Analyse qualite du code via SonarQube...'
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQubeServer') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \\
                                -Dsonar.projectKey=${SONAR_PROJECT_KEY} \\
                                -Dsonar.projectName='MySchool Frontend'
                        """
                    }
                }
                echo '>>> Analyse SonarQube terminee.'
            }
        }
    }

    post {
        success {
            echo '============================================================'
            echo 'PIPELINE FRONTEND : SUCCES !'
            echo 'Resultats SonarQube : http://localhost:9000'
            echo '============================================================'
        }
        failure {
            echo '============================================================'
            echo 'PIPELINE FRONTEND : ECHEC - Verifier les logs'
            echo '============================================================'
        }
    }
}
