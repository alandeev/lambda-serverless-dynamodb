# 01 Criar o arquivo de segurança ( quais arquivos pode acessar, etc.. )
# 02 Criar role de segurança AWS

aws iam create-role \
    --role-name lambda-exemplo \
    --assume-role-policy-document file://politicas.json \
    | tee logs/role.log

# 03 Criar arquivo(index.js) com conteudo(função handler) e zipa-lo(function.zip)
zip function.zip index.js

# 04 Criar a lambda
aws lambda create-function \
    --function-name hello-cli \
    --zip-file fileb://function.zip \
    --handler index.handler \
    --runtime nodejs14.x \
    --role arn:aws:iam::153186913191:role/lambda-exemplo \
    | tee logs/lambda-create.log

# 05 invoke lambda

aws lambda invoke \
    --function-name hello-cli \
    --log-type Tail \
    logs/lambda-exec.log

# 06 atualizar lambda (*zipar novamente* e fazer upload para aws novamente)
aws lambda update-function-code \
    --zip-file fileb://function.zip \
    --function-name hello-cli \
    --publish \
    | tee logs/lambda-update.log

## 07 remover os recrusos criado
aws lambda delete-function \
    --function-name hello-cli

aws iam delete-role \
    --role-name lambda-exemplo