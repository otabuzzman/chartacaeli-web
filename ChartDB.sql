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
