# Cleaner.sh - cleanup chart requests. Store and exec in WEB-INF directory.
#

this=$(basename $0)

. ./Runner.sh.rc

( LOGLEVEL=3 info started )

# mind order
probeJRE || { fail "Java not found." ; exit 1 ; }
probeBASDIR || { fail "BASDIR '$BASDIR' invalid." ; exit 1 ; }
probeDB || { fail "database '$DBURL' not available." ; exit 1 ; }
probeOUTDIR || { fail "OUTDIR '$OUTDIR' invalid." ; exit 1 ; }

trap termclnr 1 2 3 6 15

doit() {
	# lookup chart requests to be deleted
	creq=$(java -cp $CLASSPATH -Dh2.baseDir=$BASDIR org.h2.tools.Shell \
	-url $DBURL -user $DBUSER -password $DBPASS \
	-sql "SELECT id, modified, stat FROM charts
			WHERE stat IN ('finished', 'failed')
			AND modified < '$(( $(date +%s) - ${REQAGE:-28800} ))000'" |\
	gawk '$1~/[0-9A-Za-z]{8}/ {print $1}')

	# check and log
	[ -n "$creq" ] \
	&& { set $creq ; info "$# record(s) found" ; } \
	|| { info "nothing to do" ; return 0 ; }

	while test $# -gt 0 ; do
		id=$1 ; shift

		# check and log
		[ -d $OUTDIR/$id ] && info "found OUTDIR for chart request $id." \
		|| { warn "OUTDIR for chart request $id missing" ; continue ; }

		info "cleaning OUTDIR of request $id."
		( cd $OUTDIR ; rm -rf $id )

		# set 'cleaned' state
		info "set state 'cleaned' for $id"
		updateDB $id cleaned || fail "database problem occurred with $id."
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
