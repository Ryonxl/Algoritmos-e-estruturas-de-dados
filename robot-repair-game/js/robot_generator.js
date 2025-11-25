// js/robot_generator.js
import { ComponentStack } from './estruturas.js';
import { randomInt, randChoice, makeCode } from './utils.js';

const MODELS = ['XR-1', 'GigaFix', 'Servo-3000', 'LumaQ', 'BoltX', 'Astra-9'];
const COMPONENTS = [
    'ServoMotor', 'SensorLidar', 'CPU Module',
    'HydraulicValve', 'OpticArray', 'PowerCell',
    'JointGasket', 'CoolingFan'
];

export function generateRobot(nextId) {
    const id = nextId;
    const model = randChoice(MODELS);

    // prioridade
    const p = Math.random();
    let priority = 'Baixa';
    if (p < 0.10) priority = 'Alta';
    else if (p < 0.55) priority = 'Média';

    // pilha de componentes (1..3)
    const components = new ComponentStack();
    const cnt = randomInt(1,3);
    for (let i = 0; i < cnt; i++) {
        const nome = randChoice(COMPONENTS);
        const codigo = makeCode(randomInt(3,4));
        const tempoEst = randomInt(3,10);
        components.push(nome, codigo, tempoEst);
    }

    return {
        id,
        model,
        priority,
        components,
        state: components.isEmpty() ? 'consertado' : 'pendente'
    };
}
