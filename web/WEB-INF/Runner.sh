# Runner.sh - process chart requests. Store and exec in WEB-INF directory.
#

this=$(basename $0)

. ./$this.rc

( LOGLEVEL=3 info started )

# mind order
probeJRE || { fail "Java not found." ; exit 1 ; }
probeBASDIR || { fail "BASDIR '$BASDIR' invalid." ; exit 1 ; }
probeDB || { fail "database '$DBURL' not available." ; exit 1 ; }
probeOUTDIR || { fail "OUTDIR '$OUTDIR' invalid." ; exit 1 ; }

probeAPPDIR || { fail "APPDIR '$APPDIR' invalid." ; exit 1 ; }
probeAPPEXE || { fail "APPEXE '$APPEXE' invalid." ; exit 1 ; }
probeGS || { fail "Ghostscript not found." ; exit 1 ; }
probeIM || { fail "ImageMagick not found." ; exit 1 ; }

trap termrnnr 1 2 3 6 15

doit() {
	# lookup chart requests in 'accepted' state sorted by oldest first
	creq=$($JAVA -cp ${CLASSPATH:-lib/h2-*.jar} org.h2.tools.Shell \
	-url $DBURL -user $DBUSER -password $DBPASS \
	-sql "SELECT id, name, stat FROM charts WHERE stat = 'accepted' ORDER BY created ASC" 2>&1 |\
	gawk --posix '$1~/[0-9A-Za-z]{8}/ {print $1 " " $3}' ; exit ${PIPESTATUS[0]})

	[ $? -eq 0 ] \
	|| { fail "${creq:-org.h2.tools.Shell returned error.}" ; return 1 ; }

	# check and log
	[ -n "$creq" ] \
	&& { set $creq ; info "$(( $# / 2 )) record(s) found." ; } \
	|| { info "nothing to do." ; return 0 ; }

	while test $# -gt 0 ; do
		id=$1 name=$2 ; shift 2
		bas=$OUTDIR/$id/$name
		xml=$bas.xml

		# check and log
		[ -s $xml ] && info "found chart definition file $xml." \
		|| { warn "chart definition file $xml missing" ; dbo=$(updateDB $id failed) && info "$id set to \`failed´ : ${dbo:-null}" || fail "database problem occurred with $id : ${dbo:-null}" ; continue ; }

		pdf=$bas.pdf
		png=$bas.png
		log=$bas.log
		err=$bas.err

		# set 'started' state
		dbo=$(updateDB $id started) \
		&& info "$id set to \`startet´ : ${dbo:-null}" \
		|| fail "database problem occurred with $id : ${dbo:-null}"

		info "running $APPEXE $xml on request $id ..."
		# run Charta Caeli app
		( cd $APPDIR ; CLASSPATH=${CLASSPATH:-lib:classes:lib/*} ./$APPEXE $xml 2>$log |\
		$GS -q -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOutputFile=$pdf -_ >$err 2>&1 ; (( ! (${PIPESTATUS[0]}>0 || ${PIPESTATUS[1]}>0) )) ; exit $? ) \
		&& ( info "request $id successfully processed by $APPEXE." ; magick convert $pdf -thumbnail 320x320^ -gravity center -extent 320x320 $png ; dbo=$(updateDB $id finished) && info "$id set to \`finished´ : ${dbo:-null}" || fail "database problem occurred with $id : ${dbo:-null}" ) \
		|| ( warn "$APPEXE failed to process request $id." ; dbo=$(updateDB $id failed) && info "$id set to \`failed´ : ${dbo:-null}" || fail "database problem occurred with $id : ${dbo:-null}" )

		# remove empty log files
		[ -s $log ] || rm -f $log
		[ -s $err ] || rm -f $err

		unset id name
		unset xml
		unset pdf png
		unset log err
	done

	return 0
}

loop=1
snzz=0

while getopts "i:" opt ; do
	case $opt in
		i)
		test $OPTARG -eq $OPTARG 2>/dev/null \
		&& { loop=0 ; snzz=$OPTARG ; }
		;;
		*)
		exit 1
		;;
	esac
done
shift $((OPTIND-1))

if test $loop -eq 0 ; then
	while sleep $snzz ; do doit ; done
else
	doit
fi

exit $?
