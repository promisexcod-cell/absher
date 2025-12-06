CREATE TABLE `missing_persons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`age` int,
	`gender` enum('male','female') NOT NULL,
	`nationalId` varchar(20),
	`phoneNumber` varchar(20),
	`description` text,
	`lastSeenLocation` text,
	`lastSeenDate` timestamp,
	`photoUrl` text,
	`photoKey` varchar(255),
	`status` enum('missing','found','closed') NOT NULL DEFAULT 'missing',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `missing_persons_id` PRIMARY KEY(`id`)
);
