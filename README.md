# Charta Caeli web service
A web frontend to the Charta Caeli star chart creation tool. The web service is basically made up of an UI and a REST API connecting the UI with the Charta Caeli core application. The UI utilizes Bootstrap 4 for responsiveness. Another major component is the [Xonomy XML editor](https://github.com/michmech/xonomy) which provides a way to edit star chart definitions on devices with appropriate display sizes.

### Build
The project depends on the [repository](https://github.com/otabuzzman/chartacaeli) of the Charta Caeli star chart creation tool (core application). Thus, to setup the web service, one first has to download and build the core app according to instructions given there. Afterwards clone this repository and follow steps listed below. Run clone commands from same folder to make sure top-level directories of core app and web service share the same parent folder.
- Change directory (bash) to top-level directory of Charta Caeli web service.
- Run build commands:
  ```
  make all
  ```

- To rebuild the images (for instance to check if the core app works) run:

  ```
  # Windows (Cygwin)
  export GS_FONTPATH=c:/users/jschuck/src/chartacaeli-web\;c:/users/jschuck/src/chartacaeli
  # Linux
  export GS_FONTPATH=~/lab/chartacaeli-web:~/lab/chartacaeli

  make pdf png gng
  make install
  ```

### Notes during development

#### Xonomy web XML editor
Install XMLStarlet
- needs libxml2 and libxslt
- expects /usr/include/libxml

Cues for Cygwin
- install libxml2 and libxml2-devel packages
- install libxslt and libxslt-devel packages
- `cd /usr/include ; ln -s libxml2/libxml libxml`

Sample commands to check document specification for missing elements, attributes and patterns.
```
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

#### REST setup
Installation and configuration of Tomcat performed according to these [practice notes](http://www.ntu.edu.sg/home/ehchua/programming/howto/tomcat_howto.html) from [Nanyang Technological University](https://www.ntu.edu.sg/Pages/home.aspx) (Singapore). Page provides useful newbie information on TC setup including first *Hello World* servlet.

Create `${CATALINA_HOME}/conf/Catalina/localhost/ROOT.xml` with content `<Context docBase="<appbase>" path="" reloadable="true"/>` and `<appbase>` set appropriately (e.g. `c:\users\<user>\src\chartacaeli-web\web`) to make Charta Caeli default (start on domain URL).

- To start Tomcat on Windows enter these commands in `cmd.exe`:

  ```
  set "JAVA_HOME=C:\Program Files\Java\jdk1.8.0_151"
  cd AppData\Local\Apache\apache-tomcat-8.5.37\bin
  startup.bat
  ```

The REST API implementation uses the [Jersey](https://jersey.github.io/) RESTful Web Service framework.

#### REST API design
**Object model**

|Object|Comment|
|--|--|
|Chart||

**Object model URI**

|URI (Resource)|Comment|
|--|--|
|`/`           |API entry point|
|`/charts`     ||
|`/charts/{id}`||

**HTTP methods**

|Method|Resource|HATEOAS|Purpose|Comment|
|--|--|--|--|--|
|GET |`/`           |self, new|Access API.||
|POST|`/charts/`    |next|Issue chart creation request.|Response code 202, Location `/charts/{id}`|
|GET |`/charts/{id}`|self|Retrieve chart creation state.|Response code 304 while processing, 201 when finished. Representations updated accordingly.|

**Object representations**

|Object|Class|Comment|
|--|--|--|
|Chart  |org.chartacaeli.api.Chart  ||
|Message|org.chartacaeli.api.Message|For client information in case of no resource representation needed.|

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
