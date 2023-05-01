# CHARTA CAELI web service
A web service for the Charta Caeli star chart creation tool. The service is made up of a frontend that communicates with a backend. The frontend utilizes Bootstrap 4 for responsiveness and [Xonomy XML editor](https://github.com/michmech/xonomy) to edit star chart definitions on devices with appropriate display sizes. The backend connects the frontend with the Charta Caeli core application. It consists of a web application providing a RESTful API, a database and a Runner process for the actual star charts creation.

## Build
The project depends on the Charta Caeli star chart creation tool. Thus, to setup the web service, one first has to build that [core application](https://github.com/otabuzzman/chartacaeli) according to instructions given there. Afterwards run build commands listed below.

**Build commands on Linux**

```bash
# setup environment (sample values)
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$JAVA_HOME/bin:$PATH

# Clone Charta Caeli web service
cd ~/lab ; git clone https://github.com/otabuzzman/chartacaeli-web.git ; cd chartacaeli-web

# build frontend
make all

# build backend
mvn compile
```

**Build commands on Windows/ Cygwin**

```bash
# setup environment (sample values)
export JAVA_HOME=/cygdrive/c/program\ files/java/jdk-17
export PATH=$JAVA_HOME/bin:$PATH

# Clone Charta Caeli web service
cd ~/src ; git clone https://github.com/otabuzzman/chartacaeli-web.git ; cd chartacaeli-web

# build frontend
make all

# build backend
mvn compile
```

## Install
The web service needs a [Tomcat](https://tomcat.apache.org/index.html) 8.5 servlet container and an [H2](http://www.h2database.com/html/main.html) database. Setting up the latter is part of the build process described above. However, Tomcat requires some manual setup steps which furthermore differ for Linux and Windows/ Cygwin. More prerequisites are the Charta Caeli folder, user and group `/opt/chartacaeli`, `ccaeli` and `ccaeli` respectively.

**Prerequisites setup on Linux**

```bash
# create Charta Caeli group (if missing)
sudo groupadd ccaeli
# create Charta Caeli user (if missing)
sudo useradd -c "Charta Caeli" -d /opt/chartacaeli -m -s /sbin/nologin -g ccaeli ccaeli
sudo chmod 0775 /opt/chartacaeli
```

**Prerequisites setup on Windows/ Cygwin**

User and group are not required. Just create a folder `%USERPROFILE%\opt\chartacaeli` and configure Cygwin to mount `%USERPROFILE%\opt` on `/opt`.

**Install web service on Linux**

```bash
# setup environment (sample values)
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$JAVA_HOME/bin:$PATH

sudo -u ccaeli -- make install

# make services start on boot
sudo install -m 755 /opt/chartacaeli/ccws-db /etc/init.d
sudo chkconfig --add ccws-db
sudo chkconfig ccws-db on

sudo install -m 755 /opt/chartacaeli/ccws-runner /etc/init.d
sudo chkconfig --add ccws-runner
sudo chkconfig ccws-runner on

sudo install -m 755 /opt/chartacaeli/ccws-cleaner /etc/init.d
sudo chkconfig --add ccws-cleaner
sudo chkconfig ccws-cleaner on
```

**Install web service on Windows/ Cygwin**

```bash
# setup environment (sample values)
export JAVA_HOME=/cygdrive/c/program\ files/java/jdk-17
export PATH=$JAVA_HOME/bin:$PATH

make install
```

**Initialize H2 on Linux**

```bash
sudo -u ccaeli -- mkdir -m 0775 ${BASDIR:=/opt/chartacaeli/db}

# initialize database with H2 Shell tool
sudo -u ccaeli -- bash -c "cd /opt/chartacaeli
	$JAVA_HOME/bin/java -cp web/WEB-INF/lib/h2-2.1.210.jar org.h2.tools.Shell \
	-url jdbc:h2:$BASDIR/ChartDB -user chartacaeli -password chartaca3li \
	-sql \"RUNSCRIPT FROM 'ChartDB.sql'\""
```

**Initialize H2 on Windows/ Cygwin**

```bash
mkdir ${BASDIR:=$(cygpath -m /opt/chartacaeli/db)}

# initialize database with H2 Shell tool
java -cp web/WEB-INF/lib/h2-2.1.210.jar org.h2.tools.Shell \
	-url jdbc:h2:$BASDIR/ChartDB -user chartacaeli -password chartaca3li \
	-sql "RUNSCRIPT FROM 'ChartDB.sql'"
```

An alternative way is to use the H2 web console. Omit the `RUNSCRIPT` expression above, start an H2 server and afterward connect browser with [http://localhost:8082](http://localhost:8082). Input parameters below and copy & paste content of [`ChartDB.sql`](https://github.com/otabuzzman/chartacaeli-web/blob/master/ChartDB.sql) into respective console box.

|Parameter|Value|
|--|--|
|Saved Settings|Generic H2 (Server)|
|JDBC URL|jdbc:h2:tcp://localhost/./ChartDB|
|User Name|chartacaeli|
|Password|chartaca3li|

```bash
mkdir ${BASDIR:=$(cygpath -m /opt/chartacaeli/db)}

# initialize H2 omitting 'RUNSCRIPT'
java -cp web/WEB-INF/lib/h2-2.1.210.jar org.h2.tools.Shell \
	-url jdbc:h2:$BASDIR/ChartDB -user chartacaeli -password chartaca3li \
	-sql ""

# start H2 server in background
java -cp web/WEB-INF/lib/h2-2.1.210.jar org.h2.tools.Server \
	-baseDir $BASDIR \
	-tcp \
	-web &
```

**Initialize Tomcat**

There are plenty of ways to get Tomcat up and running on Linux and Windows. They differ in TC version, using a tarball or an installer and of course the OS and in case of Linux the derivate in question. Gopher it and ask Google. The [Nanyang Technological University](https://www3.ntu.edu.sg/Pages/home.aspx) (Singapore) provides a comprehensive description of [Tomcat installation and configuration](https://www3.ntu.edu.sg/home/ehchua/programming/howto/tomcat_howto.html) which furthermore provides useful newbie information on setup including a first *Hello World* servlet.

The setup foresees to make the Charta Caeli web service the ROOT application of Tomcat. To achieve this copy `web/META-INF/context.xml.linos` or `web/META-INF/context.xml.winos` from this repository to `${CATALINA_HOME}/conf/Catalina/localhost/ROOT.xml`. Update docBase attribute of Context element appropriately (e.g. `/opt/chartacaeli/web` on Linux or `c:\users\<user>\opt\chartacaeli\web` on Windows/ Cygwin if `c:\users\<user>\opt` mounted at `/opt`).

**Notes on Amazon Linux AMI**

```bash
# install Tomcat 8.5
sudo yum install tomcat8.5

# add missing JAR (see https://forums.aws.amazon.com/thread.jspa?threadID=231871)
sudo wget -O /usr/share/tomcat/lib/tomcat-dbcp.jar \
	https://repo1.maven.org/maven2/org/apache/tomcat/tomcat-dbcp/8.5.79/tomcat-dbcp-8.5.79.jar

# add Tomcat user `tomcat´ to `ccaeli´ group (if missing)
# so web application can write in `/opt/chartacaeli/db´ folder ceated by setup with GID `ccaeli´
sudo usermod -a -G ccaeli tomcat
# set umask to allow group writes
sudo bash -c "( echo ; echo '# Charta Caeli web service' ; echo umask 0002 ) >>/usr/share/tomcat/tomcat.conf"

# add Charta Caeli user `ccaeli´ to `tomcat´ group (if missing)
# so Runner can write in `/opt/chartacaeli/db/<id>´ folder created by web application with GID `tomcat´
sudo usermod -a -G tomcat ccaeli

# make service start on boot
sudo chkconfig --add tomcat
sudo chkconfig tomcat on
# check service start (optional)
chkconfig --list tomcat
```

- Update JAVA_HOME (e.g. `/usr/lib/jvm/java-17-openjdk`) in `/usr/share/tomcat/tomcat.conf`.

```bash
# start Tomcat service
sudo service tomcat start
# check Tomcat service (optional)
sudo fuser -v -n tcp 8080
```

**Remove installation on Linux**

```bash
# setup environment (sample values)
JAVA_HOME=/usr/lib/jvm/java-17-openjdk

# delete Charta Caeli installation
sudo rm -rf /opt/chartacaeli/*

# delete Java system and user preferences (SO #1320709)
sudo rm -rf $JAVA_HOME/jre/.systemPrefs /etc/.systemPrefs
sudo rm -rf /opt/chartacaeli/.java/.userPrefs
# user preferences of login user (not `ccaeli´)
rm -rf ~/.java/.userPrefs

# delete build artefacts
rm -rf ~/.m2
rm -rf ~/lab/chartacaeli-app
rm -rf ~/lab/chartacaeli-web
rm -rf ~/lab/META-INF
rm -rf ~/lab/pj2 ~/lab/pj2src ~/lab/pj2src.jar
```

**Remove installation on Windows/ Cygwin**

```bash
# delete Charta Caeli installation
rm -rf ~/opt/chartacaeli/*

# delete build artefacts
rm -rf ~/.m2
rm -rf ~/src/chartacaeli-app
rm -rf ~/src/chartacaeli-web
rm -rf ~/src/META-INF
rm -rf ~/src/pj2 ~/lab/pj2src ~/lab/pj2src.jar
```

```cmd
rem delete Java system preferences (SO #1320709)
rem become admin by Ctrl+Shft+Enter
rem
reg delete HKLM\SOFTWARE\JavaSoft\Prefs /f

rem delete Java user preferences
rem
reg delete HKCU\Software\JavaSoft\Prefs /f
```

## Run
A special font (`ARIALUNI.TTF`) is assumed to live in the `/opt/chartacaeli` folder.

**Run web service on Linux** (intended)

```bash
# setup environment (sample values)
JAVA_HOME=/usr/lib/jvm/java-17-openjdk
BASDIR=/opt/chartacaeli/db

# start H2 database
sudo -u ccaeli -- bash -c "cd /opt/chartacaeli/web/WEB-INF
	$JAVA_HOME/bin/java -cp lib/h2-2.1.210.jar org.h2.tools.Server \
	-baseDir $BASDIR \
	-tcp &"

# start Runner process
#
# omit -i <interval> for one-shot
sudo -u ccaeli -- bash -c "cd /opt/chartacaeli/web/WEB-INF ; unset LANG
	export GS_FONTPATH=/opt/chartacaeli:/opt/chartacaeli/web/lib
	export JAVA=$JAVA_HOME/bin/java ; LOGLEVEL=3 ./Runner.sh -i 5 &"

# start Cleaner process
#
# omit -i <interval> for one-shot
sudo -u ccaeli -- bash -c "cd /opt/chartacaeli/web/WEB-INF ; unset LANG
	export JAVA=$JAVA_HOME/bin/java ; LOGLEVEL=3 ./Cleaner.sh -i 5 &"
```

**Run web service on Windwos/ Cygwin** (testing)

```cmd
rem commands to start Tomcat in cmd.exe

set "JAVA_HOME=C:\Program Files\Java\jdk-17"
cd "C:\Program Files\Apache Software Foundation\Tomcat 8.5\bin"
startup.bat
```

```bash
# setup environment (sample values)
export JAVA_HOME=/cygdrive/c/program\ files/java/jdk-17
export PATH=$JAVA_HOME/bin:$PATH

# H2 env
export BASDIR=$(cygpath -m /opt/chartacaeli/db)

# Runner env
export OUTDIR=$(cygpath -m /opt/chartacaeli/db)
export LOGLEVEL=3  # default 0 (no output)

# Cleaner env
export OUTDIR=$(cygpath -m /opt/chartacaeli/db)
export LOGLEVEL=3  # default 0 (no output)
export REQAGE=600  # default 28800 (8 hours)

# chartacaeli.sh env
export PATH=lib:/usr/x86_64-w64-mingw32/sys-root/mingw/bin:$PATH
export CLASSPATH=$(cygpath -mp lib:classes:lib/*)
export GS_FONTPATH=$(cygpath -mp /opt/chartacaeli:/opt/chartacaeli/web/lib)

# start H2 database server
( cd /opt/chartacaeli/web/WEB-INF ; java -cp lib/h2-2.1.210.jar org.h2.tools.Server \
	-baseDir $BASDIR \
	-tcp ) &

# start Runner process
#
# omit -i <interval> for one-shot
( cd /opt/chartacaeli/web/WEB-INF ; unset LANG ; ./Runner.sh -i 5 ) &

# start Cleaner process
#
# omit -i <interval> for one-shot
( cd /opt/chartacaeli/web/WEB-INF ; unset LANG ; ./Cleaner.sh -i 5 ) &
```

## Check

The `Makefile` provides targets to check if the Charta Caeli core application prerequisite works properly. What these targets  do is generating PDF and PNG files referenced by the HTML of the frontend. On success, a couple of PDF and PNG files should live in CWD (but not installed to actually be used by the frontend). Mind this is not a test of the Charta Caeli web service.

A special font (`ARIALUNI.TTF`) is assumed to live in the `/opt/chartacaeli` folder.

**Check on Linux**

```bash
# setup Linux environment (sample values)
JAVA_HOME=/usr/lib/jvm/java-17-openjdk

# make ~ searchable if user not `ccaeli´
chmod go+x ~

# make PDF of `general-features-selection´
make general-features-selection.pdf

# make PDF and PNG files
make pdf

# make PNG files (ImageMagick required)
make png gng
```

**Check on Windows/ Cygwin**

```bash
# setup Windows/ Cygwin environment (sample values)
JAVA_HOME=/cygdrive/c/program\ files/java/jdk-17
export PATH=$JAVA_HOME/bin:$PATH

# make PDF of `general-features-selection´
make general-features-selection.pdf

# make PDF files
make pdf

# make PNG files (ImageMagick required)
make png gng
```

Perform E2E test with browser (on Windows/ Cygwin use [localhost](http://localhost:4711/custom-star-maps.html)) and run RESTful API test cases using [Postman](https://www.getpostman.com/).

---

## Development notes

### Xonomy web XML editor
Install XMLStarlet
- needs libxml2 and libxslt
- expects /usr/include/libxml

Cues for Cygwin
- install libxml2 and libxml2-devel packages
- install libxslt and libxslt-devel packages
- `cd /usr/include ; ln -s libxml2/libxml libxml`

Sample commands to check document specification for missing elements, attributes and patterns.
```bash
# elements
for e in `xml sel -t -v "//xs:element/@name" ../chartacaeli/chartacaeli.xsd | sort -u` ; do \
	echo -n $e " " ; egrep -c "^\s*\"$e\"" web/lib/chartacaeli.xsd.js ; done |\
	grep '0$'

# attributes
for a in `xml sel -t -v "//xs:attribute/@name" ../chartacaeli/chartacaeli.xsd | sort -u` ; do \
	echo -n $a " " ; egrep -c "^\s*\"$a\"" web/lib/chartacaeli.xsd.js ; done |\
	grep '0$'

# patterns
for p in `xml sel -t -v "//xs:pattern/@value" ../chartacaeli/chartacaeli.xsd | sort -u` ; do \
	echo -n $p " " ; egrep -c "^\s*{value: \"$p\"" web/lib/chartacaeli.xsd.js ; done |\
	grep '0$'
```

### Webfont creation
- Sketch glyphs in `chartacaeli-webfont.pptx` using PowerPoint (because Google Slides lacks some features like etting arbitrary linewidths, capstyles and numerical rotation angles.
- Upload deck to Drive, open with Slides, set background transparent and export glyphs to SVG.
- Create *Charta Caeli webfont* project in [IcoMoon](https://icomoon.io/) Chrome extension and import SVG files (glyphs). Use Inkscape in case of stroke to fill warnings (see [tooltip](lab/inkscape-tooltip-stroke-to-fill.png) and hints from IcoMoon).
- Click Generate Font, set Unicode codes and Metadata, finally download font and find TTF file in ZIP archive.
- Import *Charta Caeli webfont* project file `selection.json` from ZIP archive into IcoMoon.

### Style guide
Basic color palette and usage. Click on hex value to get derived palettes.

|Color|Usage|
|-----|-----|
|[#e81669](https://mycolor.space/?hex=%23e81669&sub=1) ([adjust](http://hslpicker.com/#e81669)) |Primary color of application.|
|[#892894](https://mycolor.space/?hex=%23892894&sub=1) ([adjust](http://hslpicker.com/#892894)) ||
|[#6a1f6b](https://mycolor.space/?hex=%236a1f6b&sub=1) ([adjust](http://hslpicker.com/#6a1f6b)) ||
|[#341344](https://mycolor.space/?hex=%23341344&sub=1) ([adjust](http://hslpicker.com/#341344)) ||
|[#0e1659](https://mycolor.space/?hex=%230e1659&sub=1) ([adjust](http://hslpicker.com/#0e1659)) ||
|[#3e39e8](https://mycolor.space/?hex=%233e39e8&sub=1) ([adjust](http://hslpicker.com/#3e39e8)) ||
|[#323232](https://mycolor.space/?hex=%23323232&sub=1) ([adjust](http://hslpicker.com/#323232)) |Background of brandicon.ico icon file, font color on bright background.|
|[#e7e7e7](https://mycolor.space/?hex=%23e7e7e7&sub=1) ([adjust](http://hslpicker.com/#e7e7e7)) |Font color on dark background in case of small font size or faint typography.|
|[#dadada](https://mycolor.space/?hex=%23dadada&sub=1) ([adjust](http://hslpicker.com/#dadada)) |Dimmed font color on dark background in case of large font size or strong typography.|

Subordinate styles of buttons and links.

|Type|Comment|
|----|-------|
|Navigation menu entry|Primary color 10% darkened for `:hover` and 15% for `:active`.|
|URL in text (inline)|Same as for navigation menu entries. No text decorations.|

### Thoughts on links
Purposes of links in running text is provision of background information or to give credit to the efforts of individual projects used by the site. Another reason is to ease access to sites which might somewhat tricky to find with Google even if propper keywords are given. Some general rules of thumb:
- No reference of sites everbody knows (e.g. Amazon, Google, Micosoft).
- Only one reference at first occurence.
- URLs should be limited to the host part as site structures are subject to changes.
- Preference of Wikipedia entries because site structure of Wikipedia is considered stable (based on the assumption that entries are kept up-to-date).
- References of books on Amazon with unambiguous search queries because direct links tend to be very long.
- Unsecure sites referenced with unambiguous Google search queries resulting (ideally) in a top-ranked result.

### RESTful API design
RESTful API implementation made with [Jersey](https://jersey.github.io/) RESTful Web Service framework. HATEOAS using Link header based on [RFC5988](https://tools.ietf.org/html/rfc5988).

**Object model and representations**

|Object|Class|Comment|
|--|--|--|
|Root|`org.chartacaeli.api.Root`||
|Chart|`org.chartacaeli.api.Chart`||

XML Root object representation sample if Accept header not aplication/json or missing

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<root>
  <info>Charta Caeli RESTful Web Service API</info>
  <hateoas href="http://localhost:4711/chartacaeli-web/api" rel="self"/>
  <hateoas href="http://localhost:4711/chartacaeli-web/api/charts" rel="new"/>
</root>
```

JSON Root object representation sample if Accept header equals aplication/json

```json
{
  "info": "Charta Caeli RESTful Web Service API",
  "hateoas": [
    {
      "href": "http://localhost:4711/chartacaeli-web/api",
      "rel": "self"
    },
    {
      "href": "http://localhost:4711/chartacaeli-web/api/charts",
      "rel": "new"
    }
  ]
}
```

XML Chart object representation sample

```xml
<chart id="96fc442a-12ff-4c0d-b28e-ba9e2c3e1843"> <!-- UUID -->
  <created>1569965427216</created>                <!-- UTC msec since 1.1.1970 -->
  <modified>1569965432000</modified>              <!-- UTC msec since 1.1.1970 -->
  <name>scientific-star-chart</name>              <!-- value of /ChartaCaeli/@name -->
  <stat>finished</stat>                           <!-- accepted|rejected|started|finished|failed|cleaned -->
  <!-- one or more HATEOAS links (optional) -->
  <hateoas href="http://localhost:4711/chartacaeli-web/api/charts/96fc442a-12ff-4c0d-b28e-ba9e2c3e1843" rel="self"/>
  <hateoas href="http://localhost:4711/chartacaeli-web/api/charts/96fc442a-12ff-4c0d-b28e-ba9e2c3e1843/scientific-star-chart.pdf" rel="next"/>
  <hateoas href="http://localhost:4711/chartacaeli-web/api/charts/96fc442a-12ff-4c0d-b28e-ba9e2c3e1843/scientific-star-chart.log" rel="related"/>
</chart>
```

JSON Chart object representation sample

```json
{
  "id": "96fc442a-12ff-4c0d-b28e-ba9e2c3e1843",
  "created": 1569965427216,
  "modified": 1569965432000,
  "name": "scientific-star-chart",
  "stat": "finished",
  "hateoas": [
    {
      "href": "http://localhost:4711/chartacaeli-web/api/charts/96fc442a-12ff-4c0d-b28e-ba9e2c3e1843",
      "rel": "self"
    },
    {
      "href": "http://localhost:4711/chartacaeli-web/api/charts/96fc442a-12ff-4c0d-b28e-ba9e2c3e1843/scientific-star-chart.pdf",
      "rel": "next"
    },
    {
      "href": "http://localhost:4711/chartacaeli-web/api/charts/96fc442a-12ff-4c0d-b28e-ba9e2c3e1843/scientific-star-chart.log",
      "rel": "related"
    }
  ]
}
```

**Object model URIs (Resources)**

|URI|Comment|
|--|--|
|`/`           |Entry point|
|`/charts`     |New chart|
|`/charts/{id}`|Get chart state|
|`/charts/{id}/{file}`|Get chart file with `file` being one of *.pdf, *.log, *.err, *.xml, *.preferences|

**Requests**

|URI|Method|HATEOAS|Comment|
|--|--|--|--|
|`/`|GET|self, new|Status 200. Content with Root object representation.|
|`/charts`|POST|self, next, related|Status 202. Content with Chart object representation. Encoding XML or JSON (default) according to Accept header.<br>Status 400 in case of schema violation.<br>Status 500 in case of server errors.|
|`/charts/{id}`|GET|self, next, related|Status 200. Content with Chart object representation. Encoding XML or JSON (default) according to Accept header. HATEOAS relations updated according to state.<br>Status 404 in case of invalid `{id}`.<br>Status 500 in case of server errors.|
|`/charts/{id}/{file}`|GET|self|Status 200. No HATEOAS.<br>Status 404 in case of invalid `{id}/{file}`.|

**Parameters**

|URI|Name|Kind (URL, Data)|Type|Necessity|Encoding|Comment|
|:--|:--|:--|:--|:--|:--|:--|
|`/charts`|chart|Data parameter|String|mandatory|x-www-form-urlencoded|XML document conforming to Chart Specification XSD|
||prefs|Data parameter|String|optional|x-www-form-urlencoded|XML document conforming to Java Preferences DTD|

### Helpful links
- [CSS reference]( https://www.w3schools.com/cssref/default.asp) on [w3schools.com](https://www.w3schools.com/)
- [YT tutorial](https://www.youtube.com/watch?v=emBwAyYBkC4) about a simple modern looking webpage. Actually this video started the project.
- [YT tutorial](https://www.youtube.com/watch?v=eIWRbvE1B2E) on how to setup a responsive [Bootstrap](https://getbootstrap.com/docs/4.2/getting-started/introduction/) webpage from scratch
- Discussion about [using IMG element or background-image property](https://stackoverflow.com/questions/492809/when-to-use-img-vs-css-background-image)
- Thoughts on [using style tags outside CSS stylesheets](https://www.elegantthemes.com/blog/resources/when-and-why-to-use-the-style-tag-outside-of-css-stylesheets)
- [Blog post](https://icons8.com/articles/choosing-the-right-size-and-format-for-icons/) on how to choose right icon sizes
- SO article on [best practices regarding number and position of event listeners in DOM](https://stackoverflow.com/questions/26104525/best-practices-for-where-to-add-event-listeners)
- SO article on an [animated hamburger icon](https://stackoverflow.com/questions/37758887/animated-x-icon-for-bootstrap-toggle) and an [update for Bootstrap 4](http://kylegoslan.co.uk/bootstrap-4-hamburger-menu-animation/)
- List of [media queries](https://css-tricks.com/snippets/css/media-queries-for-standard-devices/) grouped by device type
- The [Harel statechart definition](http://www.inf.ed.ac.uk/teaching/courses/seoc/2005_2006/resources/statecharts.pdf). A handy [variation of the statechart notation](http://dec.bournemouth.ac.uk/staff/kphalp/statecharts.pdf) as proposed by Harel. A [theoretical application example](https://de.slideshare.net/lmatteis/are-statecharts-the-next-big-ui-paradigm) (mind the links on 2nd last slide) and finally [bureaucracy](https://github.com/samroberton/bureaucracy), the practical implementation in Clojure on GitHub (visit links in README.md and especially take a look at [Kevin Lynagh's Sketch.systems](https://sketch.systems/tutorials/five-minute-introduction/) implementation).
- A [hierarchical FSM implementation](https://xstate.js.org/docs/#hierarchical-nested-state-machines) in JavaScript (mind the visualizer)
- The [JAX-RS API specification](https://download.oracle.com/otn-pub/jcp/jaxrs-2_1-final-eval-spec/jaxrs-2_1-final-spec.pdf) for RESTful Web Services
- [SO Answer](https://stackoverflow.com/questions/45625925/what-exactly-is-the-resourceconfig-class-in-jersey-2?answertab=active#tab-top) on various options to configure JAX-RS servlet container
- Article collection on long running asynchronous web applications: a [MS article](https://docs.microsoft.com/de-de/azure/architecture/best-practices/api-design#using-the-hateoas-approach-to-enable-navigation-to-related-resources) (German) on REST API design (contains section on asynchronous operations), [The RESTful Cookbook](http://restcookbook.com/), the [REST Guidelines](https://www.gcloud.belgium.be/rest/) ressource with a [chapter on long running tasks](https://www.gcloud.belgium.be/rest/#long-running-tasks), a [case study](https://www.endpoint.com/blog/2011/03/08/jquery-and-long-running-web-app) on long running web apps triggered by `jQuery.ajax()`, the [Jersey UG chapter](https://jersey.github.io/documentation/latest/async.html) on asynchronous services and clients, a [SO answer](https://stackoverflow.com/questions/18004527/implement-a-long-running-process-in-a-web-app?answertab=active#tab-top) that states OOTB features of HTTP 1.1 and Servlet 3.0 to handle long running web apps.
- Considerations on [REST and HATEOAS maturity level](https://m.heise.de/developer/artikel/Hoechster-Reifegrad-fuer-REST-mit-HATEOAS-3550392.html), a practical [HATEOAS implementation example](https://jaxenter.de/wer-rest-will-muss-mit-hateoas-ernst-machen-489) (both German), [REST API design](https://restfulapi.net/rest-api-design-tutorial-with-example/) and associated [implementation](https://restfulapi.net/create-rest-apis-with-jax-rs-2-0/) tutorials and [REST API design best practices in a nutshell](https://phauer.com/2015/restful-api-design-best-practices/).
- A [RESTful API implementaion example](http://zetcode.com/jaxrs/resteasyinitscripts/) with focus on H2 database initialization and post on [how to setup JPA features for database initialization](https://thoughts-on-java.org/standardized-schema-generation-data-loading-jpa-2-1/).
- Various articles on how to document a RESTful API fitting the range from [simple and practical](https://gist.github.com/iros/3426278) over to [best practice](https://bocoup.com/blog/documenting-your-api) and finally [pretty elaborated](https://idratherbewriting.com/learnapidoc/docendpoints.html)
