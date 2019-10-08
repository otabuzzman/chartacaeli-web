# Runner.sh - process chart creation requests
#

this=$(basename $0)

. ./$this.rc

( LOGLEVEL=3 info started )

trap signalhandler 1 2 3 6 15

probeJRE || { fail "Java not available. Start canceled." ; exit 1 ; }
probeDB || { fail "database '$DBURL' not available. Start canceled." ; exit 1 ; }
probeOUTDIR || { fail "OUTDIR '$OUTDIR' invalid. Start canceled" ; exit 1 ; }
probeAPPDIR || { fail "APPDIR '$APPDIR' invalid. Start canceled." ; exit 1 ; }
probeAPPEXE || { fail "APPEXE '$APPEXE' invalid. Start canceled." ; exit 1 ; }
probeGS || { fail "Ghostscript not available. Start canceled." ; exit 1 ; }

while true ; do
	# lookup oldest chart creation request in 'accepted' state
	# `stat` column is workaround for CRLF output of H2 Shell Tool
	creq=$(java -cp $CLASSPATH org.h2.tools.Shell \
	-url $DBURL -user $DBUSER -password $DBPASS \
	-sql "SELECT TOP 1 id, name, stat FROM charts WHERE stat = 'accepted' ORDER BY created ASC" |\
	gawk '$1~/[0-9A-Za-z]{8}/ {print $0}')

	# check and log
	[ -n "$creq" ] || { info "nothing to do" ; sleep ${INTERVAL:-1} ; continue ; }

	set $creq ; id=$1 name=$3
	bas=$OUTDIR/$id/$name
	xml=$bas.xml

	# check and log
	[ -s $xml ] && info "found chart definition file $xml" \
	|| { warn "chart definition file $xml missing" ; updateDB $id failed || fail "database problem occurred with $id. Cleanup manually." ; continue ; }

	pdf=$bas.pdf
	log=$bas.log
	err=$bas.err

	# set 'started' state
	info "set state 'started' for $id"
	updateDB $id started

	info "about to exec '$APPEXE $xml' ..."
	# run Charta Caeli app
	( cd $APPDIR ; ./$APPEXE $xml 2>$log |\
	$GS -q -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOutputFile=$pdf -_ >$err 2>&1 ) \
	&& ( info "...success" ; updateDB $id finished || fail "database problem occurred with $id. Cleanup manually." ) \
	|| ( warn "...failure" ; updateDB $id failed || fail "database problem occurred with $id. Cleanup manually." )

	# remove empty log files
	[ -s $log ] || rm -f $log
	[ -s $err ] || rm -f $err

	unset id name
	unset xml pdf
	unset log err
	trap - 1 2 3 6 15
done
