//Example usinf Firebase Realtime Database
import * as React from "react";
import * as mui from "@mui/material";
import { useState, useEffect, useContext } from "react";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import "react-resizable/css/styles.css";
import MuiAlert from "@mui/material/Alert";
import { useRouter } from "next/router";
import Loading from "./components/Loading";
import { Button as MuiButton } from "@mui/material";
import AppNotificationContext from "../store/notification-context";
import InfoContext from "../store/Contextinfo";
import { getDatabase, ref, onValue } from "firebase/database";
import { db2 } from "../store/firebase";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { OpenAI } from "@langchain/openai";
import { GraphCypherQAChain } from "langchain/chains/graph_qa/cypher";
import { Box } from "@mui/material";

const url = "neo4j+s://b0c2cfa5.databases.neo4j.io";
const username = "neo4j";
const password = "7dDPbiw9ohk54DCsYxL-hJgotpbwfIfdl-5x3c2425U";

let model;

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} size="large" />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const GridContainer = styled(mui.Grid)(({ theme }) => ({
  flexGrow: 1,
  margin: theme.spacing(2),
}));

const GridItem = styled(mui.Grid)(({ theme }) => ({
  [theme.breakpoints.up("sm")]: {
    flexBasis: "60%",
  },
}));

const GridPDFLoader = styled(mui.Grid)(({ theme }) => ({
  [theme.breakpoints.up("sm")]: {
    flexBasis: "40%",
  },
}));

function MyPeopleGraph({}) {
  const router = useRouter();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const notificationCtx = useContext(AppNotificationContext);
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

  const defaultCertification = {
    title: "none",
    year: "1900"
  };

  const defaultIndustry = {
    industry: "none",
    description: " ",
    yearsOfExperience: 0
  };
  
  // Destructure the query parameters from router
  const { customerId = "Z00000300", showInfo = "all" } = router.query;

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const fetchPeople = () => {
    setLoading(true);

    const peopleRef = ref(db2, "people");
    onValue(
      peopleRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const peopleArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }));

          setPeople(peopleArray);
          setLoading(false);
        } else {
          setPeople([]);
          setOpen(true);
          setLoading(false);
        }
      },
      (errorObject) => {
        setError(errorObject.message);
        setLoading(false);
        notificationCtx.showNotification({
          title: "Error!",
          message: errorObject.message,
          status: "error",
        });
      },
    );
  };

  const populateGraph = async () => {
    const graph = await Neo4jGraph.initialize({ url, username, password });
    model = new OpenAI({
      openAIApiKey: "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",
      modelName: "gpt-4-0125-preview",
      temperature: 0,
    });

    const personData = {
      name: "JOSEP RODRÍGUEZ CORTES",
      employeid: "308.pdf",
      company: "atmira",
      professionalExperience: [
        {
          position: "Project Lead",
          company: "atmira",
          dateStart: "2009-07",
          dateEnd: "", // Assuming empty string means currently working
          client: "CESCE",
          projects: [
            {
              name: "CESCE SiSnet",
              description:
                "Liderazgo de equipo de proyectos, evolutivos menores y ANS. Gestión y coordinación de equipo. Estudio y Análisis de requisitos del cliente. Gestión de proyectos y priorización.",
              technologies_tools: [
                "Eclipse",
                "Oracle",
                "JavaScript",
                "Java",
                "SiSnet",
              ],
            },
          ],
          methodology: ["Scrum", "Kanban"],
        },
        {
          position: "Analista Programador",
          company: "atmira",
          dateStart: "2009-07",
          dateEnd: "", // Assuming empty string means currently working
          client: "BBVA",
          projects: [
            {
              name: "JSP/JQuery",
              description:
                "Modificación de pantallas para adaptarlas en JQuery.",
              technologies_tools: ["Eclipse", "Oracle", "JavaScript", "JQuery"],
            },
          ],
        },
        // Add other professional experiences similarly...
      ],
      education: [
        {
          degree: "Master en Seguridad Informática",
          institution: "Universidad Oberta de Cataluña (UOC)",
          year: "2008",
        },
        {
          degree: "Ingeniería Técnica en Informática de Gestión",
          institution: "Universidad Politécnica de Cataluña (UPC)",
          year: "2005",
        },
      ],
      skills: {
        technical: [
          "Windows",
          "Linux (Mandrake, Knoppix STD)",
          "MS-DOS",
          "Photoshop",
          "FreeHand",
          "CorelDraw",
          "Dreamweaver",
          "ASP",
          "HTML",
          "JavaScript",
          "PHP",
          "Flash",
          "Swish 2.0",
          "Rational Rose",
          "Java",
          "Visual Basic",
          "C",
          "C++",
          "Python",
          "IIS",
          "SQL",
          "Oracle",
          "Informix",
          "Access",
          "SQL Server",
          "MySQL",
          "DB2",
          "PLSQL",
          "PL1",
          "JCL",
          "Cobol",
          "Tuxedo",
        ],
        // Assuming no soft skills were listed, otherwise populate this array as well
        soft: [],
      },
      industryExperience: [
        {
          industry: "Insurance",
          description:
            "Especializado en seguros de Caución en el entorno de SISnet.",
          yearsOfExperience: 14,
        },
      ],
      languages: [
        { name: "Castellano", level: "Nativo" },
        { name: "Catalán", level: "Nativo" },
        { name: "Inglés", level: "Medio" },
      ],
      certifications: [
        { title: "Certificado de Cocina", year: "2025" },
      ],
    };

    const personData2 = {
      name: "DANIEL PERALES",
      employeid: "108.pdf",
      company: "atmira",
      professionalExperience: [
        {
          "position": "Analista Orgánico",
          "company": "atmira",
          "dateStart": "2010-04",
          "dateEnd": "",
          "client": "Cesce",
          "projects": [
            {
              "name": "Cesnet",
              "description": "Gestión de incidencias, programación, soporte, pruebas, valoraciones y planificaciones, diseño. Desarrollo de servicios REST.",
              "technologies_tools": [
                "Windows",
                "Oracle 10.2.0.1.0",
                "Java (J2EE, JDK 1.8., JavaSE - 1.8)",
                "Servidor Tomcat 8.0.23",
                "Eclipse Java EE IDE for Web Developers Mars Release (4.5.0)",
                "springframework 3.0.5",
                "Maven 4.0",
                "Oracle SQL Developer 4.1.1.19",
                "Control de versiones SVN",
                "GIT",
                "Filezilla 3.6.0.1",
                "puty 0.55"
              ]
            }
          ],
          "methodology": [
            "Desarrollo en cascada",
            "Metodologías ágiles"
          ]
        },
        {
          "position": "Analista Programador",
          "company": "atmira",
          "dateStart": "2010-11",
          "dateEnd": "2016-03",
          "client": "Cesce",
          "projects": [
            {
              "name": "Cesnet",
              "description": "Gestión de incidencias, programación, soporte, pruebas, valoraciones, diseño.",
              "technologies_tools": [
                "Windows",
                "Oracle 10.2.0.1.0",
                "Java (J2EE, JDK 1.6., JavaSE - 1.6)",
                "Servidor Tomcat 6.0.33",
                "Eclipse SpringSource Tool Suite 2.6.1",
                "Ganimedes",
                "Galileo EE Ide for Web developers",
                "springframework 3.0",
                "Maven 4.0",
                "TOAD 9.7.0.51",
                "Control de versiones SVN",
                "Filezilla 3.6.0.1",
                "puty 0.55"
              ]
            }
          ],
          "methodology": [
            "Desarrollo en cascada"
          ]
        },
        {
          "position": "Analista Programador",
          "company": "atmira",
          "dateStart": "2010-04",
          "dateEnd": "2010-11",
          "client": "CECA",
          "projects": [
            {
              "name": "Csbnet",
              "description": "Gestión de incidencias, análisis de requisitos, programación, desarrollo, soporte, pruebas.",
              "technologies_tools": [
                "Windows",
                "Oracle 10.2.0.1.0",
                "Java (J2EE, JDK 1.6., JavaSE - 1.6)",
                "Servidor Tomcat 6.0.33",
                "Eclipse SpringSource Tool Suite 2.6.1",
                "Ganimedes",
                "Galileo EE Ide for Web developers",
                "springframework 3.0",
                "Maven 4.0",
                "TOAD 9.7.0.51",
                "Control de versiones SVN",
                "Filezilla 3.6.0.1",
                "puty 0.55"
              ]
            }
          ],
          "methodology": [
            "Desarrollo en cascada"
          ]
        },
        {
          "position": "Analista Programador",
          "company": "Exis - ti",
          "dateStart": "2008-12",
          "dateEnd": "2009-10",
          "client": "Iberia",
          "projects": [
            {
              "name": "Ariadna",
              "description": "Diseño de base de datos, casos de uso, diseño técnico, desarrollo, soporte, mantenimiento y pruebas.",
              "technologies_tools": [
                "Windows",
                "Linux",
                "Oracle 9.2.0.1",
                "Java (J2EE, JDK 1.5.0_17)",
                "WebMacro",
                "servidor Websphere",
                "Eclipse galileo EE Ide for Web developers",
                "TOAD 9.7.0.51",
                "Control de versiones CVS",
                "Lotus Notes 6.5",
                "Putty 0.60",
                "Filezilla 3.3.3.1",
                "Yakarta HttpClient 4.0.1"
              ]
            }
          ]
        }
      ],
      education: [
        {
          "degree": "Ingeniero Superior en Informática",
          "institution": "Facultad de Informática de la Universidad Politécnica de Madrid",
          "year": "2002"
        }
      ],
      skills: {
        technical: [
          "Spring 3.0",
          "Java",
          "Oracle",
          "Windows",
          "APACHE TOMCAT",
          "Servidor Tomcat",
          "Eclipse",
          "SpringSource Tool Suite",
          "TOAD",
          "Control de versiones CVS y SVN",
          "Filezilla",
          "Linux",
          "WebMacro",
          "Websphere",
          "Lotus Notes",
          "Putty",
          "Yakarta HttpClient",
          "Unix (Solaris)",
          "HIBERNATE",
          "Perl",
          "Framework de SPRING",
          "Eclipse SDK",
          "AJAX",
          "Weblogic",
          "Servlets",
          "UEDIT32",
          "AbsoluteTelnet",
          "Iplanet",
          "LDAP",
          "TogetherCon",
          "IIS",
          "HTML",
          "JavaScript",
          "JDK",
          "J2SEE",
          "STRUTS",
          "Edit Plus",
          "Applets",
          "CVS",
          "ANT",
          "Maven",
          "Desarrollo de servicios REST"
        ],
        soft: [],
      },
      industryExperience: [
        {
          "industry": "Technology",
          "description": "22 años de experiencia profesional en el sector TIC, enfocado en Java y J2EE desde el 2001, con conocimientos de ORACLE y SQL. Experiencia en todas las fases del ciclo de software.",
          "yearsOfExperience": 22
        },
        {
          "industry": "Insurance",
          "description": "13 años de experiencia y conocimientos en las áreas funcionales de seguros de créditos, gestión y documentación de siniestros, ventas, cobros y certificación de facturas.",
          "yearsOfExperience": 13
        }
      ],
      languages: [
        { name: "Castellano", level: "Nativo" },
        { name: "Inglés", level: "Medio" },
      ],
      certifications: [
        { title: "Certificación SISNET – Módulo Funcional", year: "2022" },
        { title: "Certificación SISNET – Arquitectura SISnet", year: "2021" },
        {
          title: "Certificación SISNET – Taller de lógica de interfaz",
          year: "2021",
        },
        { title: "Certificado de Scrum", year: "" },
      ],
    };

    const query_create_4 = `
    MERGE (p:Person {employeid: $employeid})
    ON CREATE SET p.name = $name, p.company = $company
    WITH p
    UNWIND $languages AS lang
    MERGE (l:Language {name: lang.name})
    ON CREATE SET l.name = lang.name
    MERGE (p)-[:SPEAKS {level: lang.level}]->(l)
    WITH p
    UNWIND $certifications AS cert
    MERGE (c:Certification {title: cert.title})
    ON CREATE SET c.year = cert.year, c.title = cert.title
    MERGE (p)-[:HAS_CERTIFICATION]->(c)
    WITH p
    UNWIND $professionalExperience AS pe
    MERGE (exp:Experience {position: pe.position, company: pe.company, client: pe.client})
    MERGE (p)-[:HAS_EXPERIENCE]->(exp)
    WITH p
    UNWIND $education AS edu
    MERGE (e:Education {degree: edu.degree, institution: edu.institution})
    ON CREATE SET e.year = edu.year
    MERGE (p)-[:HAS_EDUCATION]->(e)
    WITH p
    UNWIND $skills.technical AS skill
    MERGE (s:Skill {name: skill})
    MERGE (p)-[:HAS_SKILL]->(s)
    WITH p
    UNWIND $industryExperience AS ie
    MERGE (ind:IndustryExperience {industry: ie.industry})
    ON CREATE SET ind.description = ie.description, ind.yearsOfExperience = ie.yearsOfExperience
    MERGE (p)-[:HAS_INDUSTRY_EXPERIENCE]->(ind)
    `;
    
    for (const person of people) {
      // Preprocess each person's professional experience to ensure `client` field exists
      person.professional_experience = person.professional_experience.map(experience => {
        if (!experience.client) { // Checks both for undefined and empty string
          return { ...experience, client: "Unknown Client" }; // Provides a default value
        }
        return experience;
      });
      
      try {
        await graph.query(query_create_4, {
          name: person.name,
          employeid: person.employeid,
          company: person.company || 'none',
          languages: person.languages,
          certifications: person.certifications && person.certifications.length > 0 ? person.certifications : [defaultCertification],
          professionalExperience: person.professional_experience,
          education: person.education,
          skills: person.skills,
          industryExperience: person.industry_experience && person.industry_experience.length > 0 ? person.industry_experience : [defaultIndustry],
        });
        console.log(`Person ${person.name} and relationships created successfully`);
      } catch (error) {
        console.error(`Failed to create person ${person.name} and relationships:`, error);
      }
    }

    // Refresh schema
    await graph.refreshSchema();
  };

  useEffect(() => {
    if (error != "" || (people.length === 0 && !loading)) {
      notificationCtx.showNotification({
        title: "Error!",
        message: "There is no Information for that Customer!",
        status: "error",
      });
    }
  }, [error, people.length, loading, notificationCtx]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, [customerId, error, firebaseAppState, notificationCtx, router]);

  if (isLoading) {
    return <Loading type="spinningBubbles" color="#157ba7" />;
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="w-full m-auto flex-col my-6" style={{ marginTop: "50px" }}>
      <GridContainer container spacing={3}>
        <mui.Grid xs={12} sm={12} md={12} lg={12}>
          <MuiButton
            variant="outlined"
            color="primary"
            onClick={() => fetchPeople()}
          >
            Load People Data
          </MuiButton>
          {"  "}
          <MuiButton
            variant="outlined"
            color="primary"
            onClick={() => populateGraph()}
          >
            Build the Graph
          </MuiButton>
        </mui.Grid>
        <Box sx={{ width: "1450px", height: "750px" }}>
          <iframe
            title="Report Section"
            width="100%"
            height="100%"
            src="https://workspace-preview.neo4j.io/workspace/query?ntid=auth0%7C66008d9c14e3ef8d424bf1ad&_ga=2.72660891.985921476.1711783123-2059021814.1710605584"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </Box>
      </GridContainer>
    </div>
  );
}

export default MyPeopleGraph;
