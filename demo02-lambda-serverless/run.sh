# instalar
npm i -g serverless


# inicializar
sls

# config setei para tab-completion -> desinstalar
serverless config tabcompletion uninstall

# sempre fazer deploy antes de tudo para verificar se está com o ambiente OK
# [ OBS ] - ( desenvolve inteiro depois descobre que nao tinha perm em algo, etc.. )
sls deploy

# invocar  -> vai no aws e chama a função como se fosse no navegador
sls invoke -f hello

# invocar de forma local 
sls invoke local -f hello --log

# configurar dashboard 