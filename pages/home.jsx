import { useContext } from "react";
import * as mui from "@mui/material";
import { styled } from "@mui/material/styles";
import "react-resizable/css/styles.css";
import React, { useState, useEffect } from "react";
import InfoContext from "../store/Contextinfo";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CarCrashIcon from "@mui/icons-material/CarCrash";
import CardCustomer from "./components/CardCustomer";
import Policiesgrid from "./components/Policiesgrid";
import Invoicesgrid from "./components/Invoicesgrid";
import Claimsgrid from "./components/Claimsgrid";
import Loading from "./components/Loading";
import BarChart from "./components/Chartnum1";
import LineChart from "./components/Chartnum2";
import PieChart from "./components/Chartnum3";
import { useRouter } from "next/router";

const GridContainer = styled(mui.Grid)(({ theme }) => ({
  flexGrow: 1,
  margin: theme.spacing(2),
}));

export default function Home() {
  const {
    nif,
    updateNIF,
    firebaseUserID,
    firebaseApp,
    updateFirebaseuserID,
    initializeFirebase,
    firebaseAppState,
    updateFirebaseAppState,
  } = useContext(InfoContext);
  const [tabvalue, setTabvalue] = React.useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false); // Local signed-in state.
  const router = useRouter();

  useEffect(() => {
    if (!firebaseAppState) {
      router.push("/");
      return;
    }

    // Simulate a delay of 2 seconds to show the loading spinner
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, [firebaseApp, router, firebaseAppState]);

  const handleChange = (event, newValue) => {
    setTabvalue(newValue);
  };

  if (isLoading) {
    return <Loading type="spinningBubbles" color="#157ba7" />;
  }

  return (
    <div className="w-full m-auto flex-col my-6">
      <GridContainer container spacing={3}>
        <mui.Grid item xs={12} sm={6} md={4} lg={3}>
          <CardCustomer />
        </mui.Grid>
        <mui.Grid item xs={12} sm={6} md={6} lg={5}>
          <PieChart nifaSegur={nif} />
        </mui.Grid>
        <mui.Grid item xs={12} sm={6} md={6} lg={4}>
          <BarChart />
          <LineChart nifaSegur={nif} />
        </mui.Grid>
        <mui.Grid item xs={12} sm={12} md={12} lg={8}>
          <Tabs
            value={tabvalue}
            onChange={handleChange}
            aria-label="icon label tabs example"
          >
            <Tab icon={<ContentCopyIcon />} label="POLICIES" />
            <Tab icon={<ReceiptIcon />} label="INVOICES" />
            <Tab icon={<CarCrashIcon />} label="CLAIMS" />
          </Tabs>
          {tabvalue === 0 ? <Policiesgrid parnifasegurado={nif} /> : null}
          {tabvalue === 1 ? <Invoicesgrid parnifasegurado={nif} /> : null}
          {tabvalue === 2 ? <Claimsgrid parnifasegurado={nif} /> : null}
        </mui.Grid>
      </GridContainer>
    </div>
  );
}
