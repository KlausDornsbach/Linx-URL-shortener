
# Linx-URL-shortener


-> estou hospedando servidor node.js na AWS, utilizo firebase para armazenamento de dados.
não armazenei o nome dos domínios e portas para qualquer servidor poder realizar a conversão
de shortUrl de qualquer url no sistema

-> as dependencias estão instaladas no projeto github

-> realizei testes através do postman.


INSTALAÇÃO:
na máquina virtual:

git clone https://github.com/KlausDornsbach/Linx-URL-shortener

vá para o diretorio "Linx-URL-shortener"

use os comandos:
chmod +x install.sh
./install.sh

se script não instalar as dependencias use comando (com root priviledges):
curl -fsSL https://rpm.nodesource.com/setup_lts.x | bash -

vá para o diretorio "api-url-shortener"

use o comando:
node url_shortener.js



(util)
# stablish connection using ssh
ssh -i /path/my-key-pair.pem my-instance-user-name@my-instance-public-dns-name

# send files to instance
scp -i /path/my-key-pair.pem /path/my-file.txt ec2-user@my-instance-public-dns-name:path/

