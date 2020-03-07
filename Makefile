ifeq ($(OS),Windows_NT)
	winos := 1
else
	linos := 1
endif

APP		= chartacaeli

docdir = web
libdir = $(docdir)/lib
# the (W)EB-INF l(ib) folder
wibdir = $(docdir)/WEB-INF/lib
clsdir = $(docdir)/WEB-INF/classes

instdir = /opt/$(APP)

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

.PHONY: all clean instimg install lclean rclean tidy pdf png gng

vpath %.xml $(docdir)
vpath %.preferences $(docdir)

.xml.pdf:
	@test -f ./ARIALUNI.TTF || { echo "*** font file ARIALUNI.TFF missing ***" ; false ; }
ifdef winos
	( unset LANG ; cdefs=$$(realpath $<) ; cd $(instdir)/web/WEB-INF ; \
	export PATH=lib:/usr/x86_64-w64-mingw32/sys-root/mingw/bin:$$PATH ; \
	export GS_FONTPATH=$$(cygpath -mp $(instdir)) ; \
	CLASSPATH=$$(cygpath -mp lib:classes:lib/*) ./chartacaeli.sh -k $$(cygpath -m $$cdefs) |\
	$${GS:-gswin64c.exe} -q -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOutputFile=- - ) >$@
else
	( unset LANG ; cdefs=$$(realpath $<) ; cd $(instdir)/web/WEB-INF ; \
	export GS_FONTPATH=$(instdir) ; \
	JAVA=$$JAVA_HOME/bin/java CLASSPATH=lib:classes:lib/* ./chartacaeli.sh -k $$cdefs |\
	$${GS:-gs} -q -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOutputFile=- - ) >$@
endif

.pdf.png:
ifdef winos
	$${GS:-gswin64c.exe} -q -o - -r$${RES:-150} -sDEVICE=pngalpha -sPAPERSIZE=a2 -dFIXEDMEDIA -dPDFFitPage -dCompatibilityLevel=1.4 $< |\
	magick convert png:- -background "rgb(255,255,255)" -flatten $@
else
	$${GS:-gs} -q -o - -r$${RES:-150} -sDEVICE=pngalpha -sPAPERSIZE=a2 -dFIXEDMEDIA -dPDFFitPage -dCompatibilityLevel=1.4 $< |\
	magick convert png:- -background "rgb(255,255,255)" -flatten $@
endif

all: $(libdir)/xonomy $(libdir)/Justv2.ttf $(libdir)/Justv22.ttf

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

instimg: $(PDF) $(PNG) $(GNG)
	( for img in $^ ; do install $$img $(docdir) ; done )

install: $(instdir)
ifdef winos
	tar cf - web | ( cd $< ; tar xf - )
else
	tar cf - --owner=ccaeli --group=ccaeli web | ( cd $< ; tar xf - )
	install -m 0755 ccws-db $<
	install -m 0755 ccws-runner $<
	install -m 0755 ccws-cleaner $<
endif
	install -m 0644 ChartDB.sql $<

clean:
	rm -f $(PDF) $(PNG) $(GNG)

# local clean
lclean: clean
	rm -f $(libdir)/Justv2.ttf $(libdir)/Justv22.ttf

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
$(libdir)/Justv2.ttf $(libdir)/Justv22.ttf: lab/just.zip
	unzip -qod $(@D) $< $(@F)
