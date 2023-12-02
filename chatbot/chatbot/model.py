from torch.nn import Module, Linear, ReLU


class NeuraNet(Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super(NeuraNet, self).__init__()
        self.L1 = Linear(input_size, hidden_size)
        self.L2 = Linear(hidden_size, hidden_size)
        self.L3 = Linear(hidden_size, num_classes)
        self.relu = ReLU()

    def forward(self, x):
        out = self.L1(x)
        out = self.relu(out)
        out = self.L2(out)
        out = self.relu(out)
        out = self.L3(out)
        # no activation and no softmax
        return out
