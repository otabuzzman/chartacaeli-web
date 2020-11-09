# Charta Caeli web service deployment

Practices - maybe even *best* ones - to deploy Charta Caeli web service on cloud infrastructures.

## Single server configuration

Manual setup on a single Virtual Private Server (VPS) running Ubuntu 18.04. Provider is [contabo.de](https://contabo.de/). VPS access details received by mail. Domain registrar for [chartacaeli.org](https://www.whois.com/whois/chartacaeli.org) is [ionos.de](https://www.ionos.de/). Setup assumes a control node with SSH access to VPS.

* [Basic setup](#Basic-setup) - Essentially SSL setup and firewall.<br>
* [Web server setup](#Web-server-setup) - Apache web server with Let's Encrypt certificate.
* [App server setup](#App-server-setup) - Tomcat Application server behind Apache web server.
* [Charta Caeli setup](#Charta-Caeli-setup) - Setting up the Charta Caeli web service.

### Basic setup

1. VPS login (from control node)

  IP address and root password in mail from contabo.
  ```
  ip=161.97.115.13
  
  # remove VPS from SSH known hosts list
  khdir=~/.ssh
  khfile=known_hosts
  khpath=$khdir/$khfile

  egrep -qs $ip $khpath && egrep -qsv $ip $khpath >$khfile
  test -s $khfile && cp $khfile $khdir ; rm -f $khfile

  ssh root@$ip
  ```

2. Install updates
  ```
  apt update

  # if necessary
  apt upgrade
  ```

3. Replace root with leaf
  ```
  groupadd leaf
  useradd -s /bin/bash -m -g leaf leaf

  # set leaf's password
  passwd leaf

  usermod -aG sudo leaf

  # configure user in /etc/sudoers
  visudo
  ```
  **/etc/sudoers** - Add line below.
  ```
  leaf	ALL=(ALL:ALL) NOPASSWD:ALL
  ```

4. Check sudo leaf (**must not continue on failure**)
  ```
  su - leaf

  # should fail
  ls /root

  # must succeed
  sudo ls /root

  exit
  ```

5. Install public key (from control node)
  ```
  # generate keys
  ssh-keygen -b 4096 -f ~/.ssh/chartacaeli.org

  ssh-copy-id -i ~/.ssh/chartacaeli.org.pub leaf@161.97.115.13
  ```

6. Restrict SSH access
  ```
  # restrict SSH access
  vi /etc/ssh/sshd_config
  ```
  **/etc/ssh/sshd_config** - Add or change relevant lines as below.
  ```
  Port 3110

  PermitRootLogin no

  AllowUsers leaf
  PasswordAuthentication no
  ```

7. Setup firewall
  ```
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow smtp
  ufw allow http
  ufw allow https
  ufw allow 3110

  systemctl enable ufw

  apt install fail2ban

  systemctl enable fail2ban

  # configure fail2ban
  vi /etc/fail2ban/jail.local
  ```
  **/etc/fail2ban/jail.local** - Add lines below.
  ```
  [DEFAULT]
  destemail = leaf@localhost

  [sshd]
  port = 3110
  ```

8. Change domain
  ```
  hostnamectl set-hostname vmd62709.chartacaeli.org

  # update domain name
  vi /etc/hosts
  ```
  **/etc/hosts** - Change relevant line as below.
  ```
  161.97.115.13 vmd62709.chartacaeli.org vmd62709 ccws
  ```

9. Setup MTA
```
  # install sendmail
  apt install sendmail

  # configure sendmail (use defaults)
  sendmailconfig

  # set local hostnames
  vi /etc/mail/local-host-names
  ```
  **/etc/mail/local-host-names** - Add lines below.
  ```
  localhost
  vmd62709.chartacaeli.org
  mail.chartacaeli.org
  chartacaeli.org
  ```
  ```
  # configure sendmail
  vi /etc/mail/sendmail.mc
  ```
  **/etc/mail/sendmail.mc** - Add or change relevant lines as below.
  ```
  MASQUERADE_AS(`chartacaeli.org')dnl

  DAEMON_OPTIONS(`Family=inet,  Name=MTA-v4, Port=smtp')dnl
  DAEMON_OPTIONS(`Family=inet,  Name=MSP-v4, Port=submission, M=Ea')dnl

  dnl define(`confCONNECTION_RATE_THROTTLE', `15')dnl
  define(`confMAX_DAEMON_CHILDREN', `30')dnl
  dnl define(`confMIN_FREE_BLOCKS', `100')dnl
  define(`confMAX_HEADERS_LENGTH', `102400')dnl
  define(`confMAX_MESSAGE_SIZE', `1048576')dnl
  ```
  ```
  # compile configuration
  sudo bash -c "m4 /etc/mail/sendmail.mc >/etc/mail/sendmail.cf"
  ```

10. VPS reboot
  ```
  reboot
  ```

11. Set contabo nameservers for domain at ionos

12. Create DNS zone for domain/ IP at contabo

13. Consider snapshot.

### Web server setup

1. VPS login
  ```
  ssh -i ~/.ssh/chartacaeli.org leaf@chartacaeli.org -p 3110
  ```

2. Install web server
  ```
  sudo apt install apache2
  ```

3. Secure web server (basic)
  ```
  # hide Apache version and OS in HTTP header
  sudo vi /etc/apache2/conf-enabled/security.conf
  ```
  **/etc/apache2/conf-enabled/security.conf** - Add or change relevant lines as below.
  ```
  ServerTokens Prod
  ServerSignature Off
  ```
  ```
  # prevent common threats
  sudo vi /etc/apache2/apache2.conf
  ```
  **/etc/apache2/apache2.conf** - Change relevant lines as below.
  ```
  Require all denied
  ```
  **/etc/apache2/apache2.conf** - Add lines below.
  ```
  TraceEnable Off
  ```

3. Setup document root
  ```
  sudo groupadd ccaeli
  sudo useradd -c "Charta Caeli" -m -s /usr/sbin/nologin -g ccaeli ccaeli
  
  droot=/opt/chartacaeli/www

  # Charta Caeli document root
  sudo mkdir -p $droot

  sudo chown ccaeli:ccaeli $droot
  sudo chmod 775 $droot
  ```

4. Setup Virtual Hosts
  ```
  # add virtual host for http
  sudo vi /etc/apache2/sites-available/chartacaeli.org.conf
  ```
  **/etc/apache2/sites-available/chartacaeli.org.conf** - Add lines below.
  ```
  <VirtualHost *:80>
  	ServerAdmin leaf@chartacaeli.org
  	ServerName chartacaeli.org
  	ServerAlias www.chartacaeli.org
  	DocumentRoot /opt/chartacaeli/www
  	ErrorLog ${APACHE_LOG_DIR}/error.log
  	CustomLog ${APACHE_LOG_DIR}/access.log combined
  	<Directory /opt/chartacaeli/www/>
  		Options -Indexes -FollowSymLinks
  		AllowOverride None
  		Require all granted
  	</Directory>
  </VirtualHost>
  ```

  ```
  # enable virtual host
  sudo a2ensite chartacaeli.org.conf
  # disable default configuration
  sudo a2dissite 000-default.conf

  # activate configuration
  sudo systemctl reload apache2

  # check virtual host
  sudo apache2ctl configtest
  ```

5. Check [http://chartacaeli.org](http://chartacaeli.org) with browser

   On success reply will state something like access forbidden.

   **Note**: In case Apache setup section has already been completed successfully once before, one will have to remove the secure URL from the browser's cache (at least in Chrome). Therefore, in Developer Tools, Network tab click Disable Cache and open URL (http://chartacaeli.org).

6. Obtain SSL certificate

  Let's Encrypt maintains [rate limits](https://letsencrypt.org/docs/rate-limits/) on their production environment. Though the number of certificate issuings per time interval is rather huge they nevertheless recommend using their [staging environment](https://letsencrypt.org/docs/staging-environment) for development purposes like setting up CI/CD pipelines. 
  ```
  # install let's encrypt software
  sudo apt install python-certbot-apache
  
  # obtain SSL certificate
  sudo certbot -n --apache --redirect \
		-d chartacaeli.org -d www.chartacaeli.org \
		--agree-tos --email iuergen.schuck@gmail.com # check mail address
  ```

7. Check auto-renewal
  ```
  sudo certbot renew --dry-run
  ```

8. VPS reboot
  ```
  sudo reboot
  ```

9. Check secure [http**s**://chartacaeli.org](https://chartacaeli.org) with browser

10. Consider snapshot.

### App server setup

1. VPS login
  ```
  ssh -i ~/.ssh/chartacaeli.org leaf@chartacaeli.org -p 3110
  ```

2. Install Tomcat
  ```
  sudo apt install tomcat8
  ```

2. Install AJP
  ```
  sudo apt install libapache2-mod-jk
  ```

3. Configure AJP

   There are four files to configure AJP. Two for Tomcat and two for Apache web server. The Tomcat files are **server.xml** and **workers.properties**. They both reside in **${CATALINA_HOME}/conf**. Apache's are **jk.conf** and **chartacaeli.org-le-ssl.conf**. These reside in **${APACHE_CONFDIR}/mods-available** and **${APACHE_CONFDIR}/sites-available**.

   ```
   # enable AJP
   sudo vi /etc/tomcat8/server.xml
   ```
   **/etc/tomcat8/server.xml** - Enable Tomcat to accept AJP connections from Apache web server. Uncomment line given below. It's already there.
   ```
   <Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />
   ```
   ```
   # setup worker
   sudo vi /etc/tomcat8/workers.properties
   ```
   **/etc/tomcat8/workers.properties** - Declare and configure Tomcat entities (workers) to handle AJP connections. Add configuration given below to existing file or create new one. See Apache Tomcat Connector [reference](https://tomcat.apache.org/connectors-doc/reference/workers.html) for details.
   ```
   worker.list=ccws
   # worker properties
   worker.ccws.type=ajp13
   ```

   ```
   # connect web with app server
   sudo vi /etc/apache2/mods-available/jk.conf
   ```
   **/etc/apache2/mods-available/jk.conf** - Connect Apache web server with Tomcat. Replace existing entry with configuration given below.
   ```
   JkWorkersFile /etc/tomcat8/workers.properties
   ```
   ```
   # configure URI for app server
   sudo vi /etc/apache2/sites-available/chartacaeli.org-le-ssl.conf
   ```
   **/etc/apache2/sites-available/chartacaeli.org-le-ssl.conf** - Declare URI's to pass from Apache web server to Tomcat worker. Add entries given below to global part or inside `<VirtualHost>` element in question. See Apache Tomcat Connector [reference](https://tomcat.apache.org/connectors-doc/reference/apache.html) for details.
   ```
   JkMount /api* ccws
   ```

4. VPS reboot
  ```
  sudo reboot
  ```

5. Check [https://chartacaeli.org/api](https://chartacaeli.org/api) with browser

   On success reply will state a Tomcat error response.

6. Consider snapshot

### Charta Caeli setup

1. VPS login
  ```
  ssh -i ~/.ssh/chartacaeli.org leaf@chartacaeli.org -p 3110
  ```
