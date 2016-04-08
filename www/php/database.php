<?php
   include("constants.php");

   class MySQLDB {
      var $connection;
      var $syslogOutput = true;

      function MySQLDB($dbName){
         $this->syslogOutput = true;

         $this->connection = new mysqli(DB_SERVER, DB_USER, DB_PASS, $dbName);
      }
      
      function getNewID() {
         return intval(microtime(true) * 1000);
      }

      function queryToObject($query) {
         $res = $this->query($query);

         $rows = array();
         while($r = $res->fetch_assoc()) {
            $rows[] = $r;
         }

         return $rows;
      }

      function queryHasResult($query) {
         $res = $this->query($query);
         if ($res->num_rows>0) return true;
         return false;
      }

      function json_encode_results($res) {
         $rows = array();
         while($r = $res->fetch_assoc()) {
            $rows[] = $r;
         }
         return json_encode($rows);
      }
      
      function array_encode_results($res) {
         $rows = array();
         while($r = $res->fetch_assoc()) {
            $rows[] = $r;
         }
         return $rows;
       }


      function array_encode_query($q) {
         $res = $this->query($q);
         return $this->array_encode_results($res);
      }


      function query($query){
         $query = str_replace(array("\r\n", "\n", "\r"), "", $query);
         if ($this->syslogOutput ==true) syslog(LOG_INFO, "ui_sql_dbg: ".$query);
         return $this->connection->query($query);
      }

   };

?>
