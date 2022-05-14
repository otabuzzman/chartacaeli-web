# Charta Caeli web service deployment

Practices - maybe even *best* ones - to deploy Charta Caeli web service on cloud infrastructures.

## Single server configuration

Manual setup on a single Virtual Private Server (VPS) running Ubuntu 18.04. Provider is [contabo.de](https://contabo.de/). VPS access details received by mail. Domain registrar for [chartacaeli.org](https://www.whois.com/whois/chartacaeli.org) is [ionos.de](https://www.ionos.de/). Setup assumes a control node with SSH access to VPS.

* [A. Basic setup](#A-Basic-setup) - Essentially SSH setup and firewall.<br>
* [B. Web server setup](#B-Web-server-setup) - Apache web server with Let's Encrypt certificate.
* [C. App server setup](#C-App-server-setup) - Tomcat Application server behind Apache web server.
* [D. Charta Caeli setup](#D-Charta-Caeli-setup) - The Charta Caeli web service.

### A. Basic setup

1. Create new VPS (or rollback *virgin* snapshot)

2. Consider *virgin* snapshot

3. VPS login (from control node)

  IP address and root password in mail from contabo.
  ```
  ip=161.97.115.13
  
  # remove VPS from SSH known hosts list
  khdir=~/.ssh
  khfile=known_hosts
  khpath=$khdir/$khfile

  egrep -qs $ip $khpath && egrep -v $ip $khpath >$khfile
  test -s $khfile && cp $khfile $khdir ; rm -f $khfile

  ssh root@$ip
  ```

4. Install updates
  ```
  apt update

  # if necessary
  apt upgrade
  ```

5. Replace root with leaf
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
  leaf ALL=(ALL:ALL) NOPASSWD:ALL
  ```

6. Check sudo leaf (**must not continue on failure**)
  ```
  su - leaf

  # should fail
  ls /root

  # must succeed
  sudo ls /root

  exit
  ```

7. Install public key (from control node)
  ```
  # generate keys
  ssh-keygen -b 4096 -f ~/.ssh/chartacaeli.org

  ssh-copy-id -i ~/.ssh/chartacaeli.org.pub leaf@161.97.115.13
  ```

8. Restrict SSH access
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

9. Setup firewall
  ```
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow smtp
  ufw allow http
  ufw allow https
  ufw allow 3110

  systemctl enable ufw

  apt --yes install fail2ban

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

10. Change domain
  ```
  hostnamectl set-hostname vmd62709.chartacaeli.org

  # update domain name
  vi /etc/hosts
  ```
  **/etc/hosts** - Change relevant line as below.
  ```
  161.97.115.13 vmd62709.chartacaeli.org vmd62709 ccws
  ```

11. Setup MTA
  ```
  # install sendmail
  apt --yes install sendmail

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
  m4 /etc/mail/sendmail.mc >/etc/mail/sendmail.cf
  ```

12. Forward *ccaeli* to Gmail
  ```
  # configure sendmail/ Gmail authentication
  mkdir -p 0700 /etc/mail/authinfo
  cat >/etc/mail/authinfo/gmail-auth <<-EOF
  AuthInfo: "U:root" "I:iuergen.schuck@gmail.com" "P:GMAIL APP PASSWORD"
  EOF

  # configure Gmail
  vi /etc/mail/sendmail.mc
  ```
  **/etc/mail/sendmail.mc** - Add or change relevant lines as below.
  ```
  define(`SMART_HOST',`[smtp.gmail.com]')dnl
  define(`RELAY_MAILER_ARGS', `TCP $h 587')dnl
  define(`ESMTP_MAILER_ARGS', `TCP $h 587')dnl
  define(`confAUTH_OPTIONS', `A p')dnl
  TRUST_AUTH_MECH(`EXTERNAL DIGEST-MD5 CRAM-MD5 LOGIN PLAIN')dnl
  define(`confAUTH_MECHANISMS', `EXTERNAL GSSAPI DIGEST-MD5 CRAM-MD5 LOGIN PLAIN')dnl
  FEATURE(`authinfo',`hash -o /etc/mail/authinfo/gmail-auth.db')dnl
  ```
  ```
  # configure sendmail (use defaults)
  sendmailconfig
  ```

13. VPS reboot
  ```
  reboot
  ```

14. Set contabo nameservers for domain at ionos

15. Create DNS zone for domain/ IP at contabo

16. Consider snapshot

### B. Web server setup

1. VPS login (from control node)
  ```
  ssh -i ~/.ssh/chartacaeli.org leaf@chartacaeli.org -p 3110
  ```

2. Install web server
  ```
  sudo apt --yes install apache2
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
  **/etc/apache2/apache2.conf** - Add or change relevant line below.
  ```
  TraceEnable Off
  ```

3. Setup document root
  ```
  # Charta Caeli account
  sudo groupadd ccaeli
  sudo useradd -c "Charta Caeli" -d /opt/chartacaeli -m -s /usr/sbin/nologin -g ccaeli ccaeli
  
  # Charta Caeli document root
  sudo -u ccaeli -- mkdir /opt/chartacaeli/www
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

5. Check [http://161.97.115.13](http://161.97.115.13) with browser

   On success reply will state something like access forbidden.

   **Note**: In case Apache setup section has already been completed successfully once before, one will have to remove the secure URL from the browser's cache (at least in Chrome). Therefore, in Developer Tools, Network tab click Disable Cache and open URL (http://chartacaeli.org).

6. Obtain SSL certificate

  Let's Encrypt maintains [rate limits](https://letsencrypt.org/docs/rate-limits/) on their production environment. Though the number of certificate issuings per time interval is rather huge they nevertheless recommend using their [staging environment](https://letsencrypt.org/docs/staging-environment) for development purposes like setting up CI/CD pipelines. 
  ```
  # install let's encrypt software
  sudo apt --yes install python-certbot-apache
  
  # obtain SSL certificate
  sudo certbot -n --apache --redirect \
    -d chartacaeli.org -d www.chartacaeli.org \
    --agree-tos --email iuergen.schuck@gmail.com # check mail address
  ```

7. Check auto-renewal
  ```
  sudo certbot renew --dry-run
  ```

8. Setup redirection
  ```
  # redirect HTTP www.chartacaeli.org
  sudo vi /etc/apache2/sites-available/chartacaeli.org.conf
  ```
  **/etc/apache2/sites-available/chartacaeli.org.conf** - Change line as below.
  ```
  RewriteRule ^ https://chartacaeli.org%{REQUEST_URI} [END,NE,R=permanent]
  ```
  ```
  # redirect HTTPS www.chartacaeli.org
  sudo vi /etc/apache2/sites-available/chartacaeli.org-le-ssl.conf
  ```
  **/etc/apache2/sites-available/chartacaeli.org-le-ssl.conf** - Add lines below.
  ```
  RewriteEngine on
  RewriteCond %{SERVER_NAME} =www.chartacaeli.org
  RewriteRule ^ https://chartacaeli.org%{REQUEST_URI} [END,NE,R=permanent]
  ```

9. VPS reboot
  ```
  sudo reboot
  ```

10. Check secure [http**s**://chartacaeli.org](https://chartacaeli.org) with browser

11. Consider snapshot

### C. App server setup

1. VPS login (from control node)
  ```
  ssh -i ~/.ssh/chartacaeli.org leaf@chartacaeli.org -p 3110
  ```

2. Install Tomcat
  ```
  sudo apt --yes install tomcat8
  ```

3. Setup application root
  ```
  # Charta Caeli application root
  sudo -u ccaeli -- mkdir /opt/chartacaeli/web
  ```

2. Install AJP
  ```
  sudo apt --yes install libapache2-mod-jk
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

   First start after installation may take several minutes. On success reply will state a Tomcat error response.

6. Consider snapshot

### D. Charta Caeli setup

1. VPS login (from control node)
  ```
  # obtain Unicode font (e.g. search ARIALUNI.TTF on GitHub:
  # https://www.google.de/search?q=arialuni.ttf+%2Bsite%3Agithub.com)

  # provide Unicode font
  scp -i .ssh/chartacaeli.org -P 3110 ./Downloads/ARIALUNI.TTF leaf@chartacaeli.org:~
  ssh -i ~/.ssh/chartacaeli.org leaf@chartacaeli.org -p 3110 -- chmod o+r ARIALUNI.TTF

  ssh -i ~/.ssh/chartacaeli.org leaf@chartacaeli.org -p 3110
  ```

2. Install prerequisites
  ```
  [ -d ~/lab ] || mkdir ~/lab

  # package list
  pkg=" \
    bison \
    flex \
    gawk \
    g++ \
    gcc \
    ghostscript \
    git \
    libpng-dev \
    maven \
    openjdk-8-jdk-headless \
    patch \
    pkg-config \
    unzip \
    libxml2 \
    libxml2-dev \
  "

  # stop on error
  for p in $pkg ; do
    sudo apt --yes install $p || break
  done

  # ImageMagick
  src=https://github.com/ImageMagick/ImageMagick.git
  top=ImageMagick

  ( cd ~/lab ; git clone $src ; cd $top ; ./configure ; make -j $(nproc) ; sudo make install )
  sudo ldconfig /usr/local/lib

  # CXXWRAP
  tgz=cxxwrap-20061217.tar.gz
  src=http://downloads.sourceforge.net/project/cxxwrap/cxxwrap/20061217/$tgz
  top=cxxwrap-20061217

  ( cd ~/lab ; wget -q $src ; tar zxf $tgz ; cd $top ; ./configure ; make )
  ```

3. Setup CC application repo
  ```
  # chartacaeli-app
  src=https://github.com/otabuzzman/chartacaeli-app.git
  top=chartacaeli-app

  # build
  export CXX=g++
  export CXXWRAP=~/lab/cxxwrap-20061217/cxxwrap
  export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
  export PATH=$JAVA_HOME/bin:$PATH
  export LD_LIBRARY_PATH=.:lib:org/chartacaeli/caa:$LD_LIBRARY_PATH

  cd ~/lab ; git clone $src ; cd $top

  ( cd org/chartacaeli/caa ; make ; make all )
  make
  make classes

  # install
  mvn compile

  sudo -u ccaeli -- make instdep
  sudo -u ccaeli -- install ~/ARIALUNI.TTF -m 644 /opt/chartacaeli

  # setup system prefs
  sudo $JAVA_HOME/bin/java \
    org.chartacaeli.PreferencesTool \
    tree=system command=update chartacaeli.preferences
  ```

4. Check CC application (optional)
  ```
  # setup Unicode font
  ln ~/ARIALUNI.TTF ARIALUNI.TTF

  # reset user prefs
  java org.chartacaeli.PreferencesTool tree=user command=delete

  for sample in \
    layout-and-text \
    unicode-and-fonts \
    field-of-view \
    variables-and-expressions \
    milkyway-with-catalogds9 \
    azimuthal-projection ; do ( make ${sample}.pdf ) ; done
  ```

5. Setup CC web service repo
  ```
  # chartacaeli-web
  src=https://github.com/otabuzzman/chartacaeli-web.git
  top=chartacaeli-web

  # build
  cd ; cd ~/lab ; git clone $src ; cd $top

  make all

  # install
  mvn compile

  sudo -u ccaeli -- make instdep

  # setup start scripts
  for script in ccws-db ccws-runner ccws-cleaner ; do
    sudo install -m 755 /opt/chartacaeli/$script /etc/init.d
    sudo update-rc.d $script defaults
    sudo bash -c "echo JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64 >>/etc/default/$script"
  done

  # setup app server start configuration
  sudo install -m 644 /opt/chartacaeli/setenv.sh /usr/share/tomcat8/bin

  # setup app server default app
  sudo install -m 644 /opt/chartacaeli/web/META-INF/context.xml /etc/tomcat8/Catalina/localhost/ROOT.xml
  ```

6. Additional config steps
  ```
  # config web server
  sudo vi /etc/apache2/sites-available/chartacaeli.org-le-ssl.conf
  ```
  **/etc/apache2/sites-available/chartacaeli.org-le-ssl.conf** - Add lines below.
  ```
  # add after DocumentRoot
  DirectoryIndex custom-star-maps.html
  ErrorDocument 404 /error-404.html
  ```
  ```
  # config CC and TC accounts
  sudo usermod -a -G ccaeli tomcat8
  sudo usermod -a -G tomcat8 ccaeli

  # init DB
  sudo -u ccaeli -- mkdir -m 0775 ${BASDIR:=/opt/chartacaeli/db}

  sudo -u ccaeli -- bash -c "
    java -cp web/WEB-INF/lib/h2-2.1.210.jar org.h2.tools.Shell \
    -url jdbc:h2:${BASDIR}/ChartDB -user chartacaeli -password chartaca3li \
    -sql \"RUNSCRIPT FROM 'ChartDB.sql'\""
  ```

7. VPS reboot
  ```
  sudo reboot
  ```

8. Check [https://chartacaeli.org](https://chartacaeli.org) with browser

   On success the Charta Caeli web service will show up.

9. Check [https://chartacaeli.org/api](https://chartacaeli.org/api) with browser

   First after reboot may take several minutes. On success Charta Caeli RESTful API service will return some JSON.

10. Consider snapshot
