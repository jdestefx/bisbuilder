drop table if exists builds;
CREATE TABLE `builds` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `authorCode ` char(128), 
  `name` char(128) NOT NULL,
  `classID` int(11) DEFAULT NULL,
  `raceID` int(11) DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`ID`)
);

drop table if exists buildSlots;
create table `buildSlots` (
   `buildID` bigint,
   `slotID` bigint,
   `itemID` bigint,
   UNIQUE KEY `unique_one` (`buildID`, `slotID`)
);


drop table if exists authors;
create table `authors` (
   `authorCode` char(128),
   `authorName` char(128)
);


drop table if exists buildLikes;
create table `buildLikes` (
   `buildID` bigint,
   `ipAddress` char(64),
   PRIMARY KEY (`buildID`)
);