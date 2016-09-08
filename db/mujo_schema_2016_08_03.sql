-- MySQL dump 10.13  Distrib 5.6.23, for Win64 (x86_64)
--
-- Host: 134.213.136.93    Database: mujo
-- ------------------------------------------------------
-- Server version	5.5.23

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `dropdown_meta`
--

DROP TABLE IF EXISTS `dropdown_meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dropdown_meta` (
  `name` varchar(250) NOT NULL,
  `value` text,
  `siteId` int(11) NOT NULL,
  PRIMARY KEY (`name`,`siteId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exercise`
--

DROP TABLE IF EXISTS `exercise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exercise` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prescriptionId` int(11) DEFAULT NULL,
  `exerciseStationId` int(11) NOT NULL COMMENT 'Internal - 0\nExternal - 1',
  `type` varchar(255) NOT NULL,
  `laterality` int(11) NOT NULL DEFAULT '3' COMMENT 'left = 1,\nright = 2,\nboth = 3',
  `setsNo` int(11) NOT NULL DEFAULT '1',
  `repsNo` int(11) NOT NULL DEFAULT '0',
  `load` int(11) DEFAULT NULL,
  `minShoulderAngle` int(11) DEFAULT NULL,
  `maxShoulderAngle` int(11) DEFAULT NULL,
  `minElbowAngle` int(11) DEFAULT NULL,
  `maxElbowAngle` int(11) DEFAULT NULL,
  `shoulderExtendMidPointAngle` int(11) DEFAULT NULL,
  `shoulderReturnMidPointAngle` int(11) DEFAULT NULL,
  `elbowExtendMidPointAngle` int(11) DEFAULT NULL,
  `elbowReturnMidPointAngle` int(11) DEFAULT NULL,
  `setRestTime` int(11) DEFAULT NULL,
  `repRestTime` int(11) DEFAULT NULL,
  `repExtendHoldTime` float DEFAULT NULL,
  `repExtendMidTime` float DEFAULT NULL,
  `repHoldTime` int(11) DEFAULT NULL,
  `repReturnRestTime` float DEFAULT NULL,
  `repReturnMidTime` float DEFAULT NULL,
  `sortOrder` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `isDefault` bit(1) NOT NULL DEFAULT b'0',
  `notes` text,
  `siteId` int(11) DEFAULT NULL,
  `copiedFromId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_excercise_excerciseStation1_idx` (`exerciseStationId`),
  KEY `fk_excercise_assigment1_idx` (`prescriptionId`),
  KEY `ix_exercise_deletedAt` (`deletedAt`),
  KEY `fk_exercise_site_idx` (`siteId`),
  KEY `fk_exercise_parentExercise_idx` (`copiedFromId`),
  CONSTRAINT `fk_excercise_assigment1` FOREIGN KEY (`prescriptionId`) REFERENCES `prescription` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_exercise_parentExercise` FOREIGN KEY (`copiedFromId`) REFERENCES `exercise` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_exercise_site` FOREIGN KEY (`siteId`) REFERENCES `site` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exercise_session`
--

DROP TABLE IF EXISTS `exercise_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exercise_session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prescriptionId` int(11) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `duration` double DEFAULT NULL,
  `startTime` double DEFAULT NULL,
  `token` varchar(36) DEFAULT NULL,
  `machineType` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_excerciseSession_perscription1_idx` (`prescriptionId`),
  CONSTRAINT `fk_excerciseSession_perscription1` FOREIGN KEY (`prescriptionId`) REFERENCES `prescription` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patient_info_copy`
--

DROP TABLE IF EXISTS `patient_info`;
DROP TABLE IF EXISTS `patient_info_copy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patient_info_copy` (
  `userId` int(11) NOT NULL,
  `diagnosis` varchar(255) DEFAULT NULL,
  `laterality` int(11) DEFAULT NULL,
  `accident` int(11) DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `gender` int(11) DEFAULT NULL,
  `address1` varchar(255) DEFAULT NULL,
  `address2` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `post` varchar(10) DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `hobbies` text,
  `settingsSeatHeight` int(11) DEFAULT NULL,
  `settingsLeftForearm` double DEFAULT NULL,
  `settingsLeftUpperArm` double DEFAULT NULL,
  `settingsRightForearm` double DEFAULT NULL,
  `settingsRightUpperArm` double DEFAULT NULL,
  `medicalNHS` varchar(255) DEFAULT NULL,
  `medicalHospital` varchar(255) DEFAULT NULL,
  `medicalInsurance` varchar(255) DEFAULT NULL,
  `medicalClaim` int(11) DEFAULT NULL,
  `medicalPainMedication` varchar(255) DEFAULT NULL,
  `medicalMorbidities` varchar(255) DEFAULT NULL,
  `medicalGP` varchar(255) DEFAULT NULL,
  `medicalPractiseName` varchar(255) DEFAULT NULL,
  `medicalPractiseAddress1` varchar(255) DEFAULT NULL,
  `medicalPractiseAddress2` varchar(255) DEFAULT NULL,
  `medicalCity` varchar(255) DEFAULT NULL,
  `medicalPost` varchar(10) DEFAULT NULL,
  `treatmentManufacturer` varchar(255) DEFAULT NULL,
  `treatmentLaterality` int(11) DEFAULT NULL,
  `treatmentIntervention` varchar(255) DEFAULT NULL,
  `treatmentProcedure` text,
  `treatmentSurgeon` varchar(255) DEFAULT NULL,
  `treatmentFunding` varchar(255) DEFAULT NULL,
  `treatmentModel` varchar(255) DEFAULT NULL,
  `treatmentApproach` varchar(255) DEFAULT NULL,
  `treatmentSurgery` date DEFAULT NULL,
  `chronicity` varchar(255) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `weight` int(11) DEFAULT NULL,
  `notes` text,
  `outcome` text,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `unique_userId` (`userId`),
  KEY `patientinfo_diagnosis` (`diagnosis`),
  CONSTRAINT `patientInfo_physioId` FOREIGN KEY (`userId`) REFERENCES `user_copy` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `patientinfo_userId` FOREIGN KEY (`userId`) REFERENCES `user_copy` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patient_physio`
--

DROP TABLE IF EXISTS `patient_physio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patient_physio` (
  `userId` int(11) NOT NULL,
  `physioId` int(11) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  KEY `patphy_pat_idx` (`userId`),
  KEY `patphy_phy_idx` (`physioId`),
  CONSTRAINT `patphy_pat` FOREIGN KEY (`userId`) REFERENCES `patient_info_copy` (`userId`),
  CONSTRAINT `patphy_phy` FOREIGN KEY (`physioId`) REFERENCES `user_copy` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prescription`
--

DROP TABLE IF EXISTS `prescription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prescription` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `frequency` int(11) DEFAULT NULL,
  `frequencyPeriod` varchar(10) DEFAULT NULL,
  `leave` int(11) DEFAULT NULL,
  `leavePeriod` varchar(10) DEFAULT NULL,
  `notes` mediumtext,
  `statusId` tinyint(4) NOT NULL DEFAULT '0',
  `createdAt` date NOT NULL,
  `updatedAt` date NOT NULL,
  `deletedAt` date DEFAULT NULL,
  `prescriptionTypeId` tinyint(4) NOT NULL DEFAULT '1' COMMENT 'Assessment = 0,\nDefault = 1,\nPatient = 2',
  `createdBy` int(11) DEFAULT NULL,
  `siteId` int(11) NOT NULL,
  `stationType` tinyint(1) DEFAULT NULL COMMENT '0 - internal\n1- external',
  `complianceScore` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_assigment_user1_idx` (`userId`),
  KEY `fk_prescription_site1_idx` (`siteId`),
  KEY `fk_prescription_user_idx` (`createdBy`),
  CONSTRAINT `fk_prescription_site1` FOREIGN KEY (`siteId`) REFERENCES `site` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `result_exercise`
--

DROP TABLE IF EXISTS `result_exercise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `result_exercise` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exerciseResultId` varchar(36) NOT NULL,
  `exerciseId` int(11) NOT NULL,
  `exerciseSessionId` int(11) DEFAULT NULL,
  `maxShoulderAngleLeft` double DEFAULT NULL,
  `maxShoulderAngleRight` double DEFAULT NULL,
  `maxElbowAngleLeft` double DEFAULT NULL,
  `maxElbowAngleRight` double DEFAULT NULL,
  `rangePercentLeft` double DEFAULT NULL,
  `rangePercentRight` double DEFAULT NULL,
  `startTime` datetime DEFAULT NULL,
  `duration` double DEFAULT NULL,
  `skipReason` varchar(255) DEFAULT NULL,
  `load` int(11) DEFAULT NULL,
  `movementAccuracyLeft` double DEFAULT NULL,
  `movementAccuracyRight` double DEFAULT NULL,
  `loadCompliance` double DEFAULT NULL COMMENT 'pinLocation',
  `performedSets` int(11) DEFAULT NULL,
  `performedReps` int(11) DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exerciseResultId_UNIQUE` (`exerciseResultId`),
  KEY `fk_resultexercise_excercise_idx` (`exerciseId`),
  KEY `fk_resultexercise_excerciseSession_idx` (`exerciseSessionId`),
  CONSTRAINT `fk_resultexercise_excercise` FOREIGN KEY (`exerciseId`) REFERENCES `exercise` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_resultexercise_excerciseSession` FOREIGN KEY (`exerciseSessionId`) REFERENCES `exercise_session` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `result_repetition`
--

DROP TABLE IF EXISTS `result_repetition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `result_repetition` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setResultId` varchar(36) NOT NULL,
  `repNumber` int(11) NOT NULL,
  `maxShoulderAngleLeft` double DEFAULT NULL,
  `maxShoulderAngleRight` double DEFAULT NULL,
  `maxElbowAngleLeft` double DEFAULT NULL,
  `maxElbowAngleRight` double DEFAULT NULL,
  `rangePercentLeft` double DEFAULT NULL,
  `rangePercentRight` double DEFAULT NULL,
  `extendAccuracy1Left` double DEFAULT NULL,
  `extendAccuracy2Left` double DEFAULT NULL,
  `returnAccuracy1Left` double DEFAULT NULL,
  `returnAccuracy2Left` double DEFAULT NULL,
  `movementAccuracyLeft` double DEFAULT NULL,
  `extendTime1Left` double DEFAULT NULL,
  `extendTime2Left` double DEFAULT NULL,
  `returnTime1Left` double DEFAULT NULL,
  `returnTime2Left` double DEFAULT NULL,
  `holdTimeLeft` double DEFAULT NULL,
  `restTimeLeft` double DEFAULT NULL,
  `extendAccuracy1Right` double DEFAULT NULL,
  `extendAccuracy2Right` double DEFAULT NULL,
  `returnAccuracy1Right` double DEFAULT NULL,
  `returnAccuracy2Right` double DEFAULT NULL,
  `movementAccuracyRight` double DEFAULT NULL,
  `extendTime1Right` double DEFAULT NULL,
  `extendTime2Right` double DEFAULT NULL,
  `returnTime1Right` double DEFAULT NULL,
  `returnTime2Right` double DEFAULT NULL,
  `holdTimeRight` double DEFAULT NULL,
  `restTimeRight` double DEFAULT NULL,
  `startTime` datetime DEFAULT NULL,
  `duration` double DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_resultrepetition_resultset_idx` (`setResultId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `result_set`
--

DROP TABLE IF EXISTS `result_set`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `result_set` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setResultId` varchar(36) NOT NULL,
  `exerciseResultId` varchar(36) NOT NULL,
  `setNumber` int(11) NOT NULL,
  `maxShoulderAngleLeft` double DEFAULT NULL,
  `maxShoulderAngleRight` double DEFAULT NULL,
  `maxElbowAngleLeft` double DEFAULT NULL,
  `maxElbowAngleRight` double DEFAULT NULL,
  `rangePercentLeft` double DEFAULT NULL,
  `rangePercentRight` double DEFAULT NULL,
  `startTime` datetime DEFAULT NULL,
  `duration` double DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setResultId_UNIQUE` (`setResultId`),
  KEY `fk_resultset_resultexercise_idx` (`exerciseResultId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `session_token`
--

DROP TABLE IF EXISTS `session_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `session_token` (
  `token` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `site`
--

DROP TABLE IF EXISTS `site`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `site` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `isActive` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_copy`
--

DROP TABLE IF EXISTS `user_copy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_copy` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userRoleId` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` char(64) DEFAULT NULL,
  `siteId` int(11) DEFAULT NULL,
  `status` int(1) NOT NULL DEFAULT '0',
  `validationCode` char(6) DEFAULT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `invitationDate` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `fk_user_userRole_idx` (`userRoleId`),
  KEY `fk_user_site1_idx` (`siteId`),
  CONSTRAINT `fk_user_site1` FOREIGN KEY (`siteId`) REFERENCES `site` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_userRole` FOREIGN KEY (`userRoleId`) REFERENCES `user_role` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_role`
--

DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_role` (
  `id` int(11) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'mujo'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-12-11 17:07:00
