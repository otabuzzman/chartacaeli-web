docdir = web
libdir = $(docdir)/lib
labdir = $(docdir)/lab
# the (W)EB-INF l(ib) folder
wibdir = $(docdir)/WEB-INF/lib
clsdir = $(docdir)/WEB-INF/classes

JAXVER = 2.28
JAXZIP = jaxrs-ri-$(JAXVER).zip
# check in case of JAXZIP update
JAXJAR = \
jaxrs-ri/api/jakarta.ws.rs-api-2.1.5.jar \
jaxrs-ri/ext/aopalliance-repackaged-2.5.0.jar \
jaxrs-ri/ext/hk2-api-2.5.0.jar \
jaxrs-ri/ext/hk2-locator-2.5.0.jar \
jaxrs-ri/ext/hk2-utils-2.5.0.jar \
jaxrs-ri/ext/jakarta.activation-api-1.2.1.jar \
jaxrs-ri/ext/jakarta.annotation-api-1.3.4.jar \
jaxrs-ri/ext/jakarta.inject-2.5.0.jar \
jaxrs-ri/ext/jakarta.json-1.1.5.jar \
jaxrs-ri/ext/jakarta.json-api-1.1.5.jar \
jaxrs-ri/ext/jakarta.json.bind-api-1.0.1.jar \
jaxrs-ri/ext/jakarta.persistence-api-2.2.2.jar \
jaxrs-ri/ext/jakarta.servlet-api-4.0.2.jar \
jaxrs-ri/ext/jakarta.ws.rs-api-2.1.5-sources.jar \
jaxrs-ri/ext/jakarta.xml.bind-api-2.3.2.jar \
jaxrs-ri/ext/javassist-3.22.0-GA.jar \
jaxrs-ri/ext/org.osgi.core-4.2.0.jar \
jaxrs-ri/ext/osgi-resource-locator-1.0.1.jar \
jaxrs-ri/ext/validation-api-2.0.1.Final.jar \
jaxrs-ri/ext/yasson-1.0.3.jar \
jaxrs-ri/lib/jersey-client.jar \
jaxrs-ri/lib/jersey-common.jar \
jaxrs-ri/lib/jersey-container-servlet-core.jar \
jaxrs-ri/lib/jersey-container-servlet.jar \
jaxrs-ri/lib/jersey-hk2.jar \
jaxrs-ri/lib/jersey-media-jaxb.jar \
jaxrs-ri/lib/jersey-media-json-binding.jar \
jaxrs-ri/lib/jersey-media-sse.jar \
jaxrs-ri/lib/jersey-server.jar \

PDF = general-features-selection.pdf \
	scientific-star-chart.pdf \
	artistic-star-chart.pdf \
	artistic-star-chart--toppage.pdf \
	artistic-star-chart--artwork.pdf

PNG = general-features-selection.png \
	scientific-star-chart.png \
	artistic-star-chart.png \
	artistic-star-chart--toppage.png \
	artistic-star-chart--artwork.png

GNG = ccGallery_general-features-selection.png \
	ccGallery_scientific-star-chart.png \
	ccGallery_artistic-star-chart.png \
	ccGallery_artistic-star-chart--toppage.png \
	ccGallery_artistic-star-chart--artwork.png

.SUFFIXES: .xml .pdf .png

.PHONY: all clean lclean rclean tidy pdf png gng

vpath %.xml $(labdir)
vpath %.preferences $(labdir)

# top-level folder of core app (as seen from web service)
appdir = ../chartacaeli
# top-level folder of web service (as seen from core app)
webdir = ../chartacaeli-web

.xml.pdf:
	( export _JAVA_OPTIONS=-Duser.language=en ; cd $(appdir) ; make $@ VPATH=$(webdir)/$(docdir)/lab)
	@test -f $(appdir)/$@ && mv $(appdir)/$@ .

.pdf.png:
	$${GS:-gs} -q -o - -r150 -sDEVICE=pngalpha -sPAPERSIZE=a2 -dFIXEDMEDIA -dPDFFitPage -dCompatibilityLevel=1.4 $< |\
	magick convert png:- -background "rgb(255,255,255)" -flatten $@

all: lab/$(JAXZIP) $(libdir)/xonomy $(wibdir)/Justv2.ttf $(wibdir)/Justv22.ttf

pdf: $(PDF)
png: $(PNG)
gng: $(GNG)

$(PNG):
$(GNG):

ccGallery_%.png: %.png
	magick convert $< -crop x1395+0+512 $@

general-features-selection.pdf: general-features-selection.xml general-features-selection.preferences
scientific-star-chart.pdf: scientific-star-chart.xml scientific-star-chart.preferences
artistic-star-chart--toppage.pdf: artistic-star-chart--toppage.xml artistic-star-chart--toppage.preferences
artistic-star-chart--artwork.pdf: artistic-star-chart--artwork.xml artistic-star-chart--artwork.preferences
artistic-star-chart.pdf: artistic-star-chart--toppage.pdf artistic-star-chart--artwork.pdf
	pdftk $< background artistic-star-chart--artwork.pdf output $@

install: $(PDF) $(PNG) $(GNG)
	( for img in $^ ; do install $$img $(docdir) ; done )

clean:
	rm -f $(PDF) $(PNG) $(GNG)

# local clean
lclean: clean
	( for jar in $(JAXJAR) ; do rm -f $(wibdir)/`basename $$jar` ; done )
	rm -f $(wibdir)/Justv2.ttf $(wibdir)/Justv22.ttf

# real clean
rclean: lclean
	rm -f lab/$(JAXZIP)
	rm -f lab/just.zip
	rm -rf $(libdir)/xonomy

tidy: rclean

lab/$(JAXZIP):
	wget -P $(@D) -q http://repo1.maven.org/maven2/org/glassfish/jersey/bundles/jaxrs-ri/$(JAXVER)/$(@F)
	( for jar in $(JAXJAR) ; do unzip -joq -d $(wibdir) $@ $$jar || rm -f $@ ; done )

$(libdir)/xonomy:
	(cd $(libdir) ; git clone https://github.com/michmech/xonomy.git)
	(cd $@ ; git checkout 810057e13c671728d236f85579296188e93a9fb3)
lab/just.zip:
	wget -P lab -q http://www.iconian.com/fonts/just.zip
$(wibdir)/Justv2.ttf $(wibdir)/Justv22.ttf: lab/just.zip
	unzip -qod $(@D) $< $(@F)
