<?php

   include("database.php");
   include("search.php");

   class responder {
      private $bisdb;
      private $eqdb;
      private $search;
      private $po;

      function __construct() {
         $this->po = file_get_contents('php://input');
         $this->po = json_decode($this->po);

         $this->bisdb = new MySQLDB("bisbuilder");
         $this->eqdb = new MySQLDB("alk");
         $this->search = new _siteSearch($this->eqdb);

         if ($this->po->m == 1) $this->getBuildByName($this->po->buildName);
         if ($this->po->m == 2) $this->getBuildByID($this->po->buildID);
         if ($this->po->m == 3) $this->getAllBuilds();
         if ($this->po->m == 4) $this->suggestForSlotID($this->po->slotID, $this->po->classID);
         if ($this->po->m == 5) $this->saveBuild($this->po);
         if ($this->po->m == 6) $this->makeNewBuild($this->po->authorCode, $this->po->buildName);
         if ($this->po->m == 7) $this->createAuthor($this->po->authorName);
         if ($this->po->m == 8) $this->deleteBuild($this->po->buildID, $this->po->authorCode);
      }

      private function deleteBuild($buildID, $authorCode) {
         if ($this->validateAuthorCode($authorCode, $buildID)==false) {
            echo json_encode(Array("error"=>1, "message"=>"couldn't delete build"));
            return;
         }

         $buildID = $this->bisdb->connection->real_escape_string($buildID);

         $this->bisdb->query("delete from builds where ID=$buildID");
         $this->bisdb->query("delete from buildSlots where buildID=$buildID");

         echo json_encode(Array("error"=>0, "message"=>"build deleted", "buildID"=>$buildID));
      }


      private function makeNewBuild($authorCode, $buildName) {
         if ($this->validateAuthorCode($authorCode)==false) {
            echo json_encode(Array("error"=>1, "message"=>"couldn't make new build"));
            return;
         }

         $buildName = $this->bisdb->connection->real_escape_string($buildName);

         $this->bisdb->query("insert into builds values (null, '$authorCode', '$buildName', 1, 1, '')");
         $newBuildID = $this->bisdb->connection->insert_id;

         echo json_encode(Array("error"=>0, "message"=>"build created", "buildID"=>$newBuildID));
      }

      private function validateAuthorCode($authorCode, $buildID = -1) {
         $authorCode = $this->bisdb->connection->real_escape_string($authorCode);

         if ($buildID == -1) {
            if ($this->bisdb->queryHasResult("select * from authors where authorCode = \"$authorCode\"")==true) return true;
         } else {
            if ($this->bisdb->queryHasResult("select * from builds where ID=$buildID and authorCode = \"$authorCode\"")==true) return true;
         }

         return false;
      }

      private function createAuthor($authorName) {
         $ret = (object)[];
         $code = "";

         while ($code=="") {
            $code = $this->generateRandomString(12);
            if ($this->bisdb->queryHasResult("select * from authors where authorCode = \"$code\"")) $code = "";
         }

         $code = $this->bisdb->connection->real_escape_string($code);
         $authorName = $this->bisdb->connection->real_escape_string($authorName);
         $this->bisdb->query("insert into authors values (\"$code\", \"$authorName\")");

         echo json_encode(Array("error"=>0, "message"=>"saved", "generatedCode"=>$code));
      }

      private function saveBuild($po) {
         $buildID = intval($po->buildID);

         if ($this->validateAuthorCode($po->authorCode, $buildID)==false) {
            echo json_encode(Array("error"=>1, "message"=>"couldn't save slots"));
            return;
         }

         for ($i=0;$i<sizeof($po->slotData);$i++) {
            $itemID = $po->slotData[$i]->itemID;
            $slotID = $po->slotData[$i]->slotID;
            $this->bisdb->query("insert into buildSlots values ($buildID, $slotID, $itemID) on duplicate key update itemID=$itemID");
         }

         $classID = intval($po->classID);
         $raceID = intval($po->raceID);
         $this->bisdb->query("update builds set classID=$classID, raceID=$raceID where ID=$buildID");

         echo json_encode(Array("error"=>0, "message"=>"saved"));
      }

      private function suggestForSlotID($slotID, $classID) {
         $filters = (object)Array(
            "slots"=>[(object)Array("ID"=>$slotID)],
            "classes"=>[(object)Array("ID"=>$classID)]
         );

         $items = $this->search->itemSearch($filters);

         echo json_encode($items);
      }

      private function getAllBuilds() {
         echo json_encode($this->bisdb->queryToObject("select builds.*, authors.authorName from builds inner join authors on builds.authorCode=authors.authorCode"));
      }

      private function getBuildByName($buildName) {
         $buildDetails = $this->bisdb->queryToObject("select builds.*, authors.authorName from builds inner join authors on builds.authorCode=authors.authorCode where name = \"$buildName\"");
         $buildDetails = $buildDetails[0];

         $itemsInBuild = $this->bisdb->queryToObject("select * from buildSlots where buildID=".$buildDetails["ID"]);
         if (sizeof($itemsInBuild)>0) {
            $buildDetails["items"] = $this->getItemsCollectionFromBuildDetails($itemsInBuild);
         } else {
            $buildDetails["items"] = [];
         }

         echo json_encode($buildDetails);
      }

      private function getBuildByID($buildID) {
         $buildDetails = $this->bisdb->queryToObject("select builds.*, authors.authorName from builds inner join authors on builds.authorCode=authors.authorCode where ID=$buildID");
         $buildDetails = $buildDetails[0];

         $itemsInBuild = $this->bisdb->queryToObject("select * from buildSlots where buildID=$buildID");
         if (sizeof($itemsInBuild)>0) {
            $buildDetails["items"] = $this->getItemsCollectionFromBuildDetails($itemsInBuild);
         } else {
            $buildDetails["items"] = [];
         }

         echo json_encode($buildDetails);
      }

      private function getItemsCollectionFromBuildDetails($buildDetails) {
         $itemIDs = [];
         for ($i=0;$i<sizeof($buildDetails);$i++) {
            $itemIDs[] = $buildDetails[$i]["itemID"];
         }

         $itemsInBuild = $this->search->fullItemSearch(
            [(object)Array("type"=>4, "itemIDs"=>$itemIDs)]
         );

         $itemsInBuild = $itemsInBuild["inventory"];

         $ret = [];

         for ($i=0;$i<sizeof($buildDetails);$i++) {
            for ($j=0;$j<sizeof($itemsInBuild);$j++) {
               if ($itemsInBuild[$j]["itemID"]==$buildDetails[$i]["itemID"]) {
                  $ret[] = ["slotID"=>$buildDetails[$i]["slotID"], "itemDetails" => $itemsInBuild[$j]];
               }
            }
         }

         return $ret;
      }  

      private function generateRandomString($length = 10) {
          $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
          $charactersLength = strlen($characters);
          $randomString = '';
          for ($i = 0; $i < $length; $i++) {
              $randomString .= $characters[rand(0, $charactersLength - 1)];
          }
          return $randomString;
      }

   }


   new responder();


?>