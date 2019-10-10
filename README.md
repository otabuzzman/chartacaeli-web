# Charta Caeli web service
A web frontend to the Charta Caeli star chart creation tool. The web service is basically made up of an UI and a RESTful API connecting the UI with the Charta Caeli core application. The UI utilizes Bootstrap 4 for responsiveness. [Xonomy XML editor](https://github.com/michmech/xonomy) provides a way to edit star chart definitions on devices with appropriate display sizes.

### Build
The project depends on the [repository](https://github.com/otabuzzman/chartacaeli) of the Charta Caeli star chart creation tool (core application). Thus, to setup the web service, one first has to download and build the core app according to instructions given there. Afterwards clone this repository and follow steps listed below. Run clone commands from same folder to make sure top-level directories of core app and web service share the same parent folder.
- Change directory (bash) to top-level directory of Charta Caeli web service.
- Run build commands:
  ```bash
  make all
  ```

- To rebuild the images (for instance to check if the core app works) run:

  ```bash
  # Windows (Cygwin)
  export GS_FONTPATH=c:/users/jschuck/src/chartacaeli-web\;c:/users/jschuck/src/chartacaeli
  # Linux
  export GS_FONTPATH=~/lab/chartacaeli-web:~/lab/chartacaeli

  make pdf png gng
  make install
  ```

### Development notes

#### Xonomy web XML editor
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

#### Favicon creation
- Icon sketched with Google Slides but defined with Microsoft Powerpoint because Slides lacks some GUI features (e.g. setting arbitrary linewidths, capstyles and numerical rotation angles).
- Icon text in Justinian font made with Powerpoint. Set background transparent. Save text element as graphic via context menu.
- Combine icon and text images with Slides.
- Use the [IcoMoon](https://icomoon.io/) Chrome extension to generate custom fonts from SVG icons. Avoid using strokes. If not possible use [INKSCAPE](https://inkscape.org/) to [convert strokes to fills](https://inkscape.org/doc/tutorials/advanced/tutorial-advanced.html) ([tooltip](lab/inkscape-tooltip-stroke-to-fill.png)).

#### Style guide
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

#### Thoughts on links
Purposes of links in running text is provision of background information or to give credit to the efforts of individual projects used by the site. Another reason is to ease access to sites which might somewhat tricky to find with Google even if propper keywords are given. Some general rules of thumb:
- No reference of sites everbody knows (e.g. Amazon, Google, Micosoft).
- Only one reference at first occurence.
- URLs should be limited to the host part as site structures are subject to changes.
- Preference of Wikipedia entries because site structure of Wikipedia is considered stable (based on the assumption that entries are kept up-to-date).
- References of books on Amazon with unambiguous search queries because direct links tend to be very long.
- Unsecure sites referenced with unambiguous Google search queries resulting (ideally) in a top-ranked result.

|Type|Comment|
|----|-------|
|Navigation menu entry|Primary color 10% darkened for `:hover` and 15% for `:active`.|
|URL in text (inline)|Same as for navigation menu entries. No text decorations.|

#### RESTful API design
RESTful API implementation made with [Jersey](https://jersey.github.io/) RESTful Web Service framework. HATEOAS using Link header based on [RFC5988](https://tools.ietf.org/html/rfc5988) with Location header field (redirection) set to value of next relation if appropriate.

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
|`/charts/{id}/{file}`|Get chart file<br>`file` being one of *.pdf, *.log, *.err|

**Requests**

|Method|URI|HATEOAS|Comment|
|--|--|--|--|
|GET|`/`|self, new|Content with Root object representation.|
|POST|`/charts`|Location|Status 202, Location header set to `/charts/{id}`. Content with Chart object representation. Encoding XML or JSON (default) according to Accept header.<br>Status 400 in case of schema violation.<br>Status 500 in case of server errors.|
|GET|`/charts/{id}`|self, next, related|Status 200. Content with Chart object representation. Encoding XML or JSON (default) according to Accept header. HATEOAS relations updated according to state.<br>Status 404 in case of invalid `{id}`.<br>Status 500 in case of server errors.|
|GET|`/charts/{id}/{file}`|self|Status 200.<br>Status 404 in case of invalid `{file}`.|

**Parameters**

|URI|Name|Kind (URL, Data)|Type|Necessity|Encoding|Comment|
|:--|:--|:--|:--|:--|:--|:--|
|`/charts`|chart|Data parameter|String|mandatory|x-www-form-urlencoded|XML document conforming to Chart Specification XSD|
||prefs|Data parameter|String|optional|x-www-form-urlencoded|XML document conforming to Java Preferences DTD|

#### RESTful API test setup
- Open bash and start H2 database

  ```bash
  # Windows (Cygwin)
  export JAVA_HOME=/cygdrive/c/program\ files/java/jdk1.8.0_151
  export PATH=$JAVA_HOME/bin:$PATH
  # Linux
  export JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk
  export PATH=$JAVA_HOME/bin:$PATH

  java -cp web/WEB-INF/lib/h2-1.4.199.jar org.h2.tools.Server \
	-tcp \
	-web &
  ```

- Start browser and connect with H2 Console (optional)
- In H2 Console clear CHARTS table (optional)
- Change to top-level directory of Charta Caeli RESTful web service
- Set environment (or use default values in script) and start `Runner.sh`

  ```bash
  # Windows (Cygwin)
  export PATH=/usr/x86_64-w64-mingw32/sys-root/mingw/bin:$PATH
  export GS=gswin64c
  # use same DBURL in web/META-INF/context.xml and if necessary in H2 Console as well
  export DBURL="jdbc:h2:tcp://localhost/~/src/chartacaeli-web/db/ChartDB;FILE_LOCK=NO"
  export OUTDIR=$(cygpath -m ~/src/chartacaeli-web/db)
  export APPDIR=~/src/chartacaeli/mvn/web/WEB-INF
  export INTERVAL=10
  export LOGLEVEL=3
  # Linux
  export DBURL="jdbc:h2:tcp://localhost/~/src/chartacaeli-web/db/ChartDB;FILE_LOCK=NO"
  export OUTDIR=~/src/chartacaeli-web/db
  export APPDIR=~/src/chartacaeli/mvn/web/WEB-INF
  export INTERVAL=10
  export LOGLEVEL=3

  cd ~/src/chartacaeli-web
  sh Runner.sh &
  ```

- Start Charta Caeli RESTful web service (either Eclipse IDE or Tomcat)
- Run test cases with [Postman API Development Environment](https://www.getpostman.com/)

#### RESTful API test cases

|Request|Status|HATEOAS|Content|Check|Cause|
|:--|:--|:--|:--|:--|:--|
|`GET /api`|200|self, new|Welcome message|- Welcome message present<br>-new equals New chart URI<br>- self equals URI||
|`POST /api/charts`|202|Location|Chart object representation|- Location points at valid `/charts/{id}` resource.||
||400|self|Chart object representation|- stat element equals rejected<br>- info element set<br>- self equals URI|- Invalid or missing D8N.<br>- Invalid P9S.|
||500|self|Chart object representation|- stat element equals rejected<br>- info element set<br>- self equals URI||
|`GET /api/charts/{id}`|200|self, next|Chart object representation|- stat element equals accepted &#124; started<br>- self equals URI<br>- next equals URI||
||200|self|Chart object representation|- stat element equals cleaned<br>- self equals URI||
||200|self, next, related|Chart object representation|- stat element equals finished<br>- related (optional) equals *.log<br>- self equals URI<br>||
||500|self|Chart object representation|- stat element equals finished<br>- self equals URI<br>|PDF file missing on server.|
||500|self, related|Chart object representation|- stat element equals failed<br>- related equal *.log or *.err<br>- self equals URI<br>|Charta Caeli core app or PDF conversion process failed|
||500|self|Chart object representation|- stat element equals received &#124; rejected<br>- self equals URI<br>|Illegal values for stat element.|
|`GET /api/charts/{id}/{name}.pdf`|200|self|Chart PDF file|||
||404||||Invalid resource name|
|`GET /api/charts/{id}/{name}.log`|200|self|Charta Caeli core app log file|||
||404||||Invalid resource name|
|`GET /api/charts/{id}/{name}.log`|200|self|PDF conversion error file (stderr)|||
||404||||Invalid resource name|

#### Database setup
The configuration provides for the [Hibernate](https://hibernate.org/) ORM implementation twinned with an [H2](http://www.h2database.com/html/main.html) database.

- Change directory (bash) to top-level directory of Charta Caeli RESTful web service.
- Run commands to initialize database:

  ```bash
  # initialize database with H2 Shell tool
  mkdir ~/src/chartacaeli-web/db

  java -cp web/WEB-INF/lib/h2-1.4.199.jar org.h2.tools.Shell \
	-url jdbc:h2:~/src/chartacaeli-web/db/ChartDB \
	-user chartacaeli -password chartaca3li \
	-sql ""

  # start H2 Server on newly created database
  java -cp web/WEB-INF/lib/h2-1.4.199.jar org.h2.tools.Server \
	-tcp \
	-web
  ```

- Open H2 Console URL `http://localhost:8082` in browser.
- Provide parameters on login page and click Connect button.

  |Parameter|Value|
  |--|--|
  |Saved Settings|Generic H2 (Server)|
  |JDBC URL|jdbc:h2:tcp://localhost/~/src/chartacaeli-web/db/ChartDB;FILE_LOCK=NO|
  |User Name|chartacaeli|
  |Password|chartaca3li|

- Run SQL commands in H2 Console to setup database:

  ```sql
  DROP TABLE IF EXISTS `charts` ;

  CREATE TABLE `charts` (
  	`id` VARCHAR(36) NOT NULL,
  	`created` BIGINT NOT NULL,
  	`modified` BIGINT NOT NULL,
  	`name` VARCHAR(256) NOT NULL,
  	`stat` ENUM(
  		'none',
  		'received',
  		'accepted',
  		'rejected',
  		'started',
  		'finished',
  		'failed',
  		'cleaned') NOT NULL
  ) ;
  ```

- Create some entries and populate database:

  ```bash
  for s in none received accepted rejected started finished failed cleaned ; do sleep 1 ; \
		i=`uuidgen` ; c=`date +%s`000 ; m=`date +%s`003 ; echo \
		"INSERT INTO \`CHARTS\` (\`ID\`, \`CREATED\`, \`MODIFIED\`, \`NAME\`, \`STAT\`) \
		VALUES ('$i', '$c', '$m', 'scientific-star-chart', '$s') ;" ; done
  ```

  ```sql
  INSERT INTO `CHARTS` (`ID`, `CREATED`, `MODIFIED`, `NAME`, `STAT`)  VALUES ('fccc5742-9999-40a7-bf50-bbd1f79719d9', '1566126471000', '1566126471003', 'scientific-star-chart', 'none') ;
  INSERT INTO `CHARTS` (`ID`, `CREATED`, `MODIFIED`, `NAME`, `STAT`)  VALUES ('ce98dca2-81e2-4f37-b6bf-6b66ab094aec', '1566126472000', '1566126472003', 'scientific-star-chart', 'received') ;
  INSERT INTO `CHARTS` (`ID`, `CREATED`, `MODIFIED`, `NAME`, `STAT`)  VALUES ('31593fa8-3078-4a59-87f2-f8c4837cb202', '1566126473000', '1566126473003', 'scientific-star-chart', 'accepted') ;
  INSERT INTO `CHARTS` (`ID`, `CREATED`, `MODIFIED`, `NAME`, `STAT`)  VALUES ('39aefc5e-5dbd-41d9-b72b-75b3bbf5c83c', '1566126474000', '1566126474003', 'scientific-star-chart', 'rejected') ;
  INSERT INTO `CHARTS` (`ID`, `CREATED`, `MODIFIED`, `NAME`, `STAT`)  VALUES ('628a8519-0f25-41c7-a711-3cbc78a5393a', '1566126476000', '1566126476003', 'scientific-star-chart', 'started') ;
  INSERT INTO `CHARTS` (`ID`, `CREATED`, `MODIFIED`, `NAME`, `STAT`)  VALUES ('3c03731d-117a-4781-a82d-dd495b4b606d', '1566126477000', '1566126477003', 'scientific-star-chart', 'finished') ;
  INSERT INTO `CHARTS` (`ID`, `CREATED`, `MODIFIED`, `NAME`, `STAT`)  VALUES ('4736b81d-1405-4c9c-8ea5-4f8e1a6869b2', '1566126478000', '1566126478003', 'scientific-star-chart', 'failed') ;
  INSERT INTO `CHARTS` (`ID`, `CREATED`, `MODIFIED`, `NAME`, `STAT`)  VALUES ('2e541e9d-67b3-44d8-9b91-f513704f054a', '1566126479000', '1566126479003', 'scientific-star-chart', 'cleaned') ;
  ```

#### Tomcat setup
Installation and configuration of Tomcat performed according to these [practice notes](http://www.ntu.edu.sg/home/ehchua/programming/howto/tomcat_howto.html) from [Nanyang Technological University](https://www.ntu.edu.sg/Pages/home.aspx) (Singapore). Page provides useful newbie information on TC setup including first *Hello World* servlet.

Copy `META-INF/context.xml` from this repository to `${CATALINA_HOME}/conf/Catalina/localhost/ROOT.xml`. Update Context element to `<Context docBase="<appbase>" path="" reloadable="true"/>` with `<appbase>` set appropriately (e.g. `c:\users\<user>\src\chartacaeli-web\web`). This makes Charta Caeli the default web app (start on domain URL).

- To start Tomcat on Windows enter these commands in `cmd.exe`:

  ```bash
  set "JAVA_HOME=C:\Program Files\Java\jdk1.8.0_151"
  cd AppData\Local\Apache\apache-tomcat-8.5.37\bin
  startup.bat
  ```

#### Helpful links
- [CSS reference]( https://www.w3schools.com/cssref/default.asp) on [w3schools.com](https://www.w3schools.com/)
- [YT tutorial](https://www.youtube.com/watch?v=emBwAyYBkC4) about a simple modern looking webpage. Actually this video started the project.
- [YT tutorial](https://www.youtube.com/watch?v=eIWRbvE1B2E) on how to setup a responsive [Bootstrap](https://getbootstrap.com/docs/4.2/getting-started/introduction/) webpage from scratch
- Discussion about [using IMG element or background-image property](https://stackoverflow.com/questions/492809/when-to-use-img-vs-css-background-image)
- Thoughts on [using style tags outside CSS stylesheets](https://www.elegantthemes.com/blog/resources/when-and-why-to-use-the-style-tag-outside-of-css-stylesheets)
- [Blog post](https://icons8.com/articles/choosing-the-right-size-and-format-for-icons/) on how to choose right icon sizes
- SO article on [best practices for where to add event listeners](https://stackoverflow.com/questions/26104525/best-practices-for-where-to-add-event-listeners)
- SO article on an [animated hamburger icon](https://stackoverflow.com/questions/37758887/animated-x-icon-for-bootstrap-toggle) and an [update for Bootstrap 4](http://kylegoslan.co.uk/bootstrap-4-hamburger-menu-animation/)
- List of [media queries](https://css-tricks.com/snippets/css/media-queries-for-standard-devices/) grouped by device type
- The [Harel statechart definition](http://www.inf.ed.ac.uk/teaching/courses/seoc/2005_2006/resources/statecharts.pdf). A handy [variation of the statechart notation](http://dec.bournemouth.ac.uk/staff/kphalp/statecharts.pdf) as proposed by Harel. A [theoretical application example](https://de.slideshare.net/lmatteis/are-statecharts-the-next-big-ui-paradigm) (mind the links on 2nd last slide) and finally [bureaucracy](https://github.com/samroberton/bureaucracy), the practical implementation in Clojure on GitHub (visit links in README.md and especially take a look at [Kevin Lynagh's Sketch.system](https://sketch.systems/tutorials/five-minute-introduction/) implementation).
- A [hierarchical FSM implementation](https://xstate.js.org/docs/#hierarchical-nested-state-machines) in JavaScript (mind the visualizer)
- [SO Answer](https://stackoverflow.com/questions/45625925/what-exactly-is-the-resourceconfig-class-in-jersey-2?answertab=active#tab-top) on various options to configure JAX-RS servlet container
- Article collection on long running asynchronous web applications: a [MS article](https://docs.microsoft.com/de-de/azure/architecture/best-practices/api-design#using-the-hateoas-approach-to-enable-navigation-to-related-resources) (German) on REST API design (contains section on asynchronous operations), [The RESTful Cookbook](http://restcookbook.com/), the [REST Guidelines](https://www.gcloud.belgium.be/rest/) ressource with a [chapter on long running tasks](https://www.gcloud.belgium.be/rest/#long-running-tasks), a [case study](https://www.endpoint.com/blog/2011/03/08/jquery-and-long-running-web-app) on long running web apps triggered by `jQuery.ajax()`, the [Jersey UG chapter](https://jersey.github.io/documentation/latest/async.html) on asynchronous services and clients, a [SO answer](https://stackoverflow.com/questions/18004527/implement-a-long-running-process-in-a-web-app?answertab=active#tab-top) that states OOTB features of HTTP 1.1 and Servlet 3.0.
- Considerations on [REST and HATEOAS maturity level](https://m.heise.de/developer/artikel/Hoechster-Reifegrad-fuer-REST-mit-HATEOAS-3550392.html), a practical [HATEOAS implementation example](https://jaxenter.de/wer-rest-will-muss-mit-hateoas-ernst-machen-489) (both German), [REST API design](https://restfulapi.net/rest-api-design-tutorial-with-example/) and associated [implementation](https://restfulapi.net/create-rest-apis-with-jax-rs-2-0/) tutorials and [REST API design best practices in a nutshell](https://phauer.com/2015/restful-api-design-best-practices/).
