docdir = web
libdir = $(docdir)/lib
labdir = $(docdir)/lab
# the (W)EB-INF l(ib) folder
wibdir = $(docdir)/WEB-INF/lib
clsdir = $(docdir)/WEB-INF/classes

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
	$${GS:-gs} -q -o - -r$${RES:-150} -sDEVICE=pngalpha -sPAPERSIZE=a2 -dFIXEDMEDIA -dPDFFitPage -dCompatibilityLevel=1.4 $< |\
	magick convert png:- -background "rgb(255,255,255)" -flatten $@

all: $(libdir)/xonomy $(wibdir)/Justv2.ttf $(wibdir)/Justv22.ttf

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
	rm -f $(wibdir)/Justv2.ttf $(wibdir)/Justv22.ttf

# real clean
rclean: lclean
	rm -f lab/just.zip
	rm -rf $(libdir)/xonomy

tidy: rclean

$(libdir)/xonomy:
	(cd $(libdir) ; git clone https://github.com/michmech/xonomy.git)
	(cd $@ ; git checkout 810057e13c671728d236f85579296188e93a9fb3)
lab/just.zip:
	wget -P lab -q http://www.iconian.com/fonts/just.zip
$(wibdir)/Justv2.ttf $(wibdir)/Justv22.ttf: lab/just.zip
	unzip -qod $(@D) $< $(@F)
